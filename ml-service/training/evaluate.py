"""
Evaluates a trained checkpoint on the held-out test split: overall accuracy,
macro-F1, per-class precision/recall, a confusion matrix image, and a list
of the worst-performing classes (by F1) to prioritize for more data.

Usage:
    python evaluate.py --data-dir data/processed --checkpoint ../artifacts/best_model.pt
"""

import argparse
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import torch
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

from train import IMAGENET_MEAN, IMAGENET_STD, INPUT_SIZE, build_model


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default="data/processed")
    parser.add_argument("--checkpoint", default="../artifacts/best_model.pt")
    parser.add_argument("--out-dir", default="../artifacts/eval")
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    eval_transform = transforms.Compose(
        [
            transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )
    test_ds = datasets.ImageFolder(Path(args.data_dir) / "test", transform=eval_transform)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False, num_workers=2)
    class_names = test_ds.classes

    model = build_model(len(class_names)).to(device)
    model.load_state_dict(torch.load(args.checkpoint, map_location=device))
    model.eval()

    all_preds, all_labels = [], []
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            all_preds.extend(outputs.argmax(dim=1).cpu().tolist())
            all_labels.extend(labels.tolist())

    accuracy = accuracy_score(all_labels, all_preds)
    macro_f1 = f1_score(all_labels, all_preds, average="macro", zero_division=0)
    report = classification_report(
        all_labels, all_preds, target_names=class_names, output_dict=True, zero_division=0
    )

    print(f"Accuracy: {accuracy:.4f}")
    print(f"Macro-F1: {macro_f1:.4f}\n")

    per_class_f1 = [(name, report[name]["f1-score"]) for name in class_names]
    worst = sorted(per_class_f1, key=lambda x: x[1])[:5]
    print("Worst-performing classes (lowest F1 — prioritize for more data/review):")
    for name, f1 in worst:
        print(f"  - {name}: F1={f1:.4f}")

    cm = confusion_matrix(all_labels, all_preds)
    fig, ax = plt.subplots(figsize=(max(6, len(class_names) * 0.6), max(6, len(class_names) * 0.6)))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(class_names)))
    ax.set_yticks(range(len(class_names)))
    ax.set_xticklabels(class_names, rotation=90)
    ax.set_yticklabels(class_names)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title("Confusion Matrix")
    fig.colorbar(im)
    fig.tight_layout()
    cm_path = out_dir / "confusion_matrix.png"
    fig.savefig(cm_path)
    print(f"\nConfusion matrix saved to {cm_path}")

    summary = {
        "accuracy": accuracy,
        "macroF1": macro_f1,
        "perClass": report,
        "worstClasses": [{"label": name, "f1": f1} for name, f1 in worst],
    }
    summary_path = out_dir / "evaluation_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"Full evaluation summary saved to {summary_path}")


if __name__ == "__main__":
    main()
