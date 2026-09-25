"""
Two-stage transfer learning on MobileNetV3-Large (ImageNet pretrained):
  Stage 1 — freeze the backbone, train only the classifier head.
  Stage 2 — unfreeze the last few blocks, fine-tune at a lower learning rate.

Augmentations include a blur pass to simulate low-quality phone cameras,
since the target users are farmers on low-end Android devices. Uses a
class-weighted loss to handle dataset imbalance, early stopping, and
checkpoints the best model by validation macro-F1.

Usage:
    python train.py --data-dir data/processed --epochs-stage1 5 --epochs-stage2 10
"""

import argparse
import json
from pathlib import Path

import torch
import torch.nn as nn
from sklearn.metrics import f1_score
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
INPUT_SIZE = 224


def build_transforms():
    train_transform = transforms.Compose(
        [
            transforms.RandomResizedCrop(INPUT_SIZE, scale=(0.7, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(20),
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
            transforms.RandomApply([transforms.GaussianBlur(kernel_size=5)], p=0.3),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )
    eval_transform = transforms.Compose(
        [
            transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )
    return train_transform, eval_transform


def build_model(num_classes: int) -> nn.Module:
    model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


def set_backbone_trainable(model: nn.Module, trainable: bool, unfreeze_last_n_blocks: int = 0):
    for param in model.features.parameters():
        param.requires_grad = trainable
    if not trainable and unfreeze_last_n_blocks > 0:
        for block in list(model.features.children())[-unfreeze_last_n_blocks:]:
            for param in block.parameters():
                param.requires_grad = True


def compute_class_weights(dataset: datasets.ImageFolder, num_classes: int) -> torch.Tensor:
    counts = torch.zeros(num_classes)
    for _, label in dataset.samples:
        counts[label] += 1
    counts = torch.clamp(counts, min=1)
    weights = counts.sum() / (num_classes * counts)
    return weights


def run_epoch(model, loader, criterion, optimizer, device, train: bool):
    model.train() if train else model.eval()
    total_loss = 0.0
    all_preds, all_labels = [], []

    with torch.set_grad_enabled(train):
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            if train:
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            total_loss += loss.item() * images.size(0)
            all_preds.extend(outputs.argmax(dim=1).cpu().tolist())
            all_labels.extend(labels.cpu().tolist())

    avg_loss = total_loss / len(loader.dataset)
    macro_f1 = f1_score(all_labels, all_preds, average="macro", zero_division=0)
    return avg_loss, macro_f1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default="data/processed")
    parser.add_argument("--checkpoint-dir", default="../artifacts")
    parser.add_argument("--epochs-stage1", type=int, default=5)
    parser.add_argument("--epochs-stage2", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr-stage1", type=float, default=1e-3)
    parser.add_argument("--lr-stage2", type=float, default=1e-5)
    parser.add_argument("--unfreeze-last-n-blocks", type=int, default=3)
    parser.add_argument("--patience", type=int, default=4, help="Early stopping patience (epochs)")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_transform, eval_transform = build_transforms()

    train_ds = datasets.ImageFolder(Path(args.data_dir) / "train", transform=train_transform)
    val_ds = datasets.ImageFolder(Path(args.data_dir) / "val", transform=eval_transform)
    num_classes = len(train_ds.classes)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=2)

    model = build_model(num_classes).to(device)
    class_weights = compute_class_weights(train_ds, num_classes).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    checkpoint_dir = Path(args.checkpoint_dir)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    best_f1 = -1.0
    epochs_without_improvement = 0

    def maybe_checkpoint(macro_f1: float, stage: str, epoch: int):
        nonlocal best_f1, epochs_without_improvement
        if macro_f1 > best_f1:
            best_f1 = macro_f1
            epochs_without_improvement = 0
            torch.save(model.state_dict(), checkpoint_dir / "best_model.pt")
            print(f"  -> new best macro-F1 {macro_f1:.4f}, checkpoint saved ({stage} epoch {epoch})")
        else:
            epochs_without_improvement += 1

    # Stage 1: freeze backbone, train classifier head only.
    set_backbone_trainable(model, trainable=False)
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr_stage1)
    for epoch in range(1, args.epochs_stage1 + 1):
        train_loss, train_f1 = run_epoch(model, train_loader, criterion, optimizer, device, train=True)
        val_loss, val_f1 = run_epoch(model, val_loader, criterion, optimizer, device, train=False)
        print(f"[stage1 epoch {epoch}] train_loss={train_loss:.4f} train_f1={train_f1:.4f} "
              f"val_loss={val_loss:.4f} val_f1={val_f1:.4f}")
        maybe_checkpoint(val_f1, "stage1", epoch)
        if epochs_without_improvement >= args.patience:
            print("Early stopping (stage 1)")
            break

    # Stage 2: unfreeze the last few blocks, fine-tune at a lower LR.
    set_backbone_trainable(model, trainable=False, unfreeze_last_n_blocks=args.unfreeze_last_n_blocks)
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr_stage2)
    epochs_without_improvement = 0
    for epoch in range(1, args.epochs_stage2 + 1):
        train_loss, train_f1 = run_epoch(model, train_loader, criterion, optimizer, device, train=True)
        val_loss, val_f1 = run_epoch(model, val_loader, criterion, optimizer, device, train=False)
        print(f"[stage2 epoch {epoch}] train_loss={train_loss:.4f} train_f1={train_f1:.4f} "
              f"val_loss={val_loss:.4f} val_f1={val_f1:.4f}")
        maybe_checkpoint(val_f1, "stage2", epoch)
        if epochs_without_improvement >= args.patience:
            print("Early stopping (stage 2)")
            break

    with open(checkpoint_dir / "class_index.json", "w", encoding="utf-8") as f:
        json.dump(train_ds.classes, f, indent=2)

    print(f"\nTraining complete. Best validation macro-F1: {best_f1:.4f}")
    print(f"Best weights: {checkpoint_dir / 'best_model.pt'}")
    print("Run export.py next to produce a TorchScript artifact for the inference service.")


if __name__ == "__main__":
    main()
