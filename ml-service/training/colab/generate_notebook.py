"""Generates the Colab training notebook as valid .ipynb JSON."""
import json

def md(text):
    return {"cell_type": "markdown", "metadata": {}, "source": text.splitlines(keepends=True)}

def code(text):
    return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": text.splitlines(keepends=True)}

cells = []

cells.append(md("""# Manthulir — Multi-crop pest/disease model training

Runs entirely on **Google's GPU** (Colab), not your local machine. Re-downloads
all source datasets directly from their public hosts (GitHub + Mendeley Data),
so it needs nothing from your local machine to get started.

**Before running**: `Runtime` → `Change runtime type` → select a **GPU**
(T4 is fine and free-tier).

**At the end**: this notebook zips up the trained model and offers it as a
download (`trained_model.zip`) — bring that back and unzip it into
`ml-service/artifacts/` locally to deploy it, and check
`evaluation_summary.json` / `confusion_matrix.png` inside for the real
per-class results to record in `EXPERIMENT_NOTES.md`.

33 classes, 5 crops: tomato (7 diseases + healthy + 8 insects), potato
(2 diseases + healthy), bell pepper (1 disease + healthy), paddy/rice
(6 insects), brinjal/eggplant (4 diseases + 1 generic insect-damage class +
healthy). See `ml-service/training/EXPERIMENT_NOTES.md` in the repo for full
data provenance and licensing (all CC BY 4.0 or GitHub-public)."""))

cells.append(md("## 1. Check GPU"))
cells.append(code("""import torch
print("CUDA available:", torch.cuda.is_available())
print("Device:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU only — go set Runtime > Change runtime type > GPU")
"""))

cells.append(md("## 2. Class list (33 classes across 5 crops)\n\nSame `class_config.py` as the local repo — label ↔ source dataset ↔ exact folder name."))
cells.append(code("""PEST_DISEASE_CLASSES = [
    {"label": "tomato_bacterial_spot", "source": "plantvillage", "datasetLabel": "Tomato___Bacterial_spot"},
    {"label": "tomato_early_blight", "source": "plantvillage", "datasetLabel": "Tomato___Early_blight"},
    {"label": "tomato_late_blight", "source": "plantvillage", "datasetLabel": "Tomato___Late_blight"},
    {"label": "tomato_leaf_mold", "source": "plantvillage", "datasetLabel": "Tomato___Leaf_Mold"},
    {"label": "tomato_septoria_leaf_spot", "source": "plantvillage", "datasetLabel": "Tomato___Septoria_leaf_spot"},
    {"label": "tomato_yellow_leaf_curl_virus", "source": "plantvillage", "datasetLabel": "Tomato___Tomato_Yellow_Leaf_Curl_Virus"},
    {"label": "tomato_mosaic_virus", "source": "plantvillage", "datasetLabel": "Tomato___Tomato_mosaic_virus"},
    {"label": "tomato_healthy", "source": "plantvillage", "datasetLabel": "Tomato___healthy"},
    {"label": "tomato_spider_mite", "source": "tomato_pest_mendeley", "datasetLabel": "TU"},
    {"label": "tomato_whitefly", "source": "tomato_pest_mendeley", "datasetLabel": "BA"},
    {"label": "tomato_fruit_fly", "source": "tomato_pest_mendeley", "datasetLabel": "ZC"},
    {"label": "tomato_thrips", "source": "tomato_pest_mendeley", "datasetLabel": "TP"},
    {"label": "tomato_aphid", "source": "tomato_pest_mendeley", "datasetLabel": "MP"},
    {"label": "tomato_tobacco_cutworm", "source": "tomato_pest_mendeley", "datasetLabel": "SL"},
    {"label": "tomato_beet_armyworm", "source": "tomato_pest_mendeley", "datasetLabel": "SE"},
    {"label": "tomato_fruit_borer", "source": "tomato_pest_mendeley", "datasetLabel": "HA"},
    {"label": "potato_early_blight", "source": "plantvillage", "datasetLabel": "Potato___Early_blight"},
    {"label": "potato_late_blight", "source": "plantvillage", "datasetLabel": "Potato___Late_blight"},
    {"label": "potato_healthy", "source": "plantvillage", "datasetLabel": "Potato___healthy"},
    {"label": "bell_pepper_bacterial_spot", "source": "plantvillage", "datasetLabel": "Pepper,_bell___Bacterial_spot"},
    {"label": "bell_pepper_healthy", "source": "plantvillage", "datasetLabel": "Pepper,_bell___healthy"},
    {"label": "paddy_brown_planthopper", "source": "paddy_pest_mendeley", "datasetLabel": "Brown_Planthopper"},
    {"label": "paddy_green_leafhopper", "source": "paddy_pest_mendeley", "datasetLabel": "Green_Leafhoppers"},
    {"label": "paddy_leaf_folder", "source": "paddy_pest_mendeley", "datasetLabel": "LEAF_FOLDERS"},
    {"label": "paddy_rice_bug", "source": "paddy_pest_mendeley", "datasetLabel": "Rice_Bug"},
    {"label": "paddy_stem_borer", "source": "paddy_pest_mendeley", "datasetLabel": "Stemz_Borer"},
    {"label": "paddy_whorl_maggot", "source": "paddy_pest_mendeley", "datasetLabel": "Whorl_Maggot"},
    {"label": "brinjal_healthy", "source": "brinjal_disease_mendeley", "datasetLabel": "Healthy Leaf"},
    {"label": "brinjal_insect_pest_damage", "source": "brinjal_disease_mendeley", "datasetLabel": "Insect Pest Disease"},
    {"label": "brinjal_leaf_spot", "source": "brinjal_disease_mendeley", "datasetLabel": "Leaf Spot Disease"},
    {"label": "brinjal_mosaic_virus", "source": "brinjal_disease_mendeley", "datasetLabel": "Mosaic Virus Disease"},
    {"label": "brinjal_white_mold", "source": "brinjal_disease_mendeley", "datasetLabel": "White Mold Disease"},
    {"label": "brinjal_wilt", "source": "brinjal_disease_mendeley", "datasetLabel": "Wilt Disease"},
]
TRAIN_SPLIT, VAL_SPLIT, TEST_SPLIT = 0.70, 0.15, 0.15
print(len(PEST_DISEASE_CLASSES), "classes configured")
"""))

cells.append(md("""## 3. Download raw data

Each dataset is pulled from its original public host — nothing proxied
through your machine. Only the **original** (non-augmented) image subset is
used from every Mendeley dataset that ships a pre-augmented copy alongside
it — using the augmented copies and splitting randomly would leak
near-duplicate images across train/val/test and inflate the reported
accuracy (see `EXPERIMENT_NOTES.md`)."""))

cells.append(code("""!mkdir -p data/raw
!pip install -q py7zr
"""))

cells.append(md("### 3a. PlantVillage (tomato, potato, bell pepper diseases) — GitHub sparse-checkout"))
cells.append(code("""%%bash
set -e
rm -rf pv-tmp
git clone --filter=blob:none --no-checkout --depth 1 https://github.com/spMohanty/PlantVillage-Dataset.git pv-tmp
cd pv-tmp
git sparse-checkout init --cone
git sparse-checkout set \\
  "raw/color/Tomato___Bacterial_spot" \\
  "raw/color/Tomato___Early_blight" \\
  "raw/color/Tomato___Late_blight" \\
  "raw/color/Tomato___Leaf_Mold" \\
  "raw/color/Tomato___Septoria_leaf_spot" \\
  "raw/color/Tomato___Tomato_Yellow_Leaf_Curl_Virus" \\
  "raw/color/Tomato___Tomato_mosaic_virus" \\
  "raw/color/Tomato___healthy" \\
  "raw/color/Potato___Early_blight" \\
  "raw/color/Potato___Late_blight" \\
  "raw/color/Potato___healthy" \\
  "raw/color/Pepper,_bell___Bacterial_spot" \\
  "raw/color/Pepper,_bell___healthy"
git checkout master
"""))
cells.append(code("""import shutil, pathlib
dest = pathlib.Path("data/raw/plantvillage")
dest.mkdir(parents=True, exist_ok=True)
src = pathlib.Path("pv-tmp/raw/color")
for d in src.iterdir():
    if d.is_dir():
        shutil.copytree(d, dest / d.name, dirs_exist_ok=True)
shutil.rmtree("pv-tmp")
print(sorted(p.name for p in dest.iterdir()))
"""))

cells.append(md("### 3b. Tomato insect pests — Mendeley Data (Huang & Chuang 2020, CC BY 4.0, doi:10.17632/s62zm6djd2.1)"))
cells.append(code("""%%bash
set -e
mkdir -p tmp_tomato_pest
curl -sL "https://data.mendeley.com/public-files/datasets/s62zm6djd2/files/e2e3fc63-2eb3-4860-aec7-4089731ddb2e/file_downloaded" -o tmp_tomato_pest/original.7z
"""))
cells.append(code("""import py7zr, shutil, pathlib
with py7zr.SevenZipFile("tmp_tomato_pest/original.7z", mode="r") as z:
    z.extractall(path="tmp_tomato_pest/extracted")
src = next(pathlib.Path("tmp_tomato_pest/extracted").glob("*"))  # "Original image of tomato pest"
dest = pathlib.Path("data/raw/tomato_pest_mendeley")
dest.mkdir(parents=True, exist_ok=True)
for d in src.iterdir():
    if d.is_dir():
        shutil.copytree(d, dest / d.name, dirs_exist_ok=True)
shutil.rmtree("tmp_tomato_pest")
print(sorted(p.name for p in dest.iterdir()))
"""))

cells.append(md("### 3c. Paddy/rice insect pests — Mendeley Data (\"Paddy Field Pest Image Dataset\", CC BY 4.0, doi:10.17632/y5hwbhrn5m.1)\n\nThe outer zip contains three inner zips (`original_data`, `augmented_data`, `preprocessed_data`) — only `original_data` is used."))
cells.append(code("""%%bash
set -e
mkdir -p tmp_paddy_pest
curl -sL "https://data.mendeley.com/public-files/datasets/y5hwbhrn5m/files/f3d30629-6778-41e3-97a7-35d7f1b627a0/file_downloaded" -o tmp_paddy_pest/paddy.zip
cd tmp_paddy_pest && unzip -q paddy.zip -d extracted
"""))
cells.append(code("""import zipfile, shutil, pathlib
inner_dir = next(pathlib.Path("tmp_paddy_pest/extracted").glob("*"))  # "New folder (4)" or similar
original_zip = next(inner_dir.glob("original_data*.zip"))
with zipfile.ZipFile(original_zip) as z:
    z.extractall(inner_dir / "original")
src = inner_dir / "original" / "original_data"
dest = pathlib.Path("data/raw/paddy_pest_mendeley")
dest.mkdir(parents=True, exist_ok=True)
for d in src.iterdir():
    if d.is_dir():
        shutil.copytree(d, dest / d.name, dirs_exist_ok=True)
shutil.rmtree("tmp_paddy_pest")
print(sorted(p.name for p in dest.iterdir()))
"""))

cells.append(md("### 3d. Brinjal/eggplant diseases — Mendeley Data (\"Eggplant Leaf Disease Detection Dataset\", CC BY 4.0, doi:10.17632/d3ypkphghb.2)\n\n~2.3GB zip. The zip contains `Original Dataset/` and `Augmented Dataset/` — only `Original Dataset/` is used."))
cells.append(code("""%%bash
set -e
mkdir -p tmp_brinjal
curl -sL -C - --retry 5 --retry-delay 5 "https://data.mendeley.com/public-files/datasets/d3ypkphghb/files/8d1e6735-41b8-43e5-a157-d171243abd63/file_downloaded" -o tmp_brinjal/eggplant.zip
cd tmp_brinjal && unzip -q eggplant.zip -d extracted
"""))
cells.append(code("""import shutil, pathlib
crop_root = next(pathlib.Path("tmp_brinjal/extracted").glob("*"))  # "Eggplant  Dataset"
src = crop_root / "Original Dataset"
dest = pathlib.Path("data/raw/brinjal_disease_mendeley")
dest.mkdir(parents=True, exist_ok=True)
for d in src.iterdir():
    if d.is_dir():
        shutil.copytree(d, dest / d.name, dirs_exist_ok=True)
shutil.rmtree("tmp_brinjal")
print(sorted(p.name for p in dest.iterdir()))
"""))

cells.append(md("### Sanity check: per-class image counts"))
cells.append(code("""import pathlib
for entry in PEST_DISEASE_CLASSES:
    p = pathlib.Path("data/raw") / entry["source"] / entry["datasetLabel"]
    n = len(list(p.glob("*"))) if p.exists() else -1
    flag = "" if n > 0 else "  <-- MISSING/EMPTY, check the download step above"
    print(f"{entry['label']:35s} {n:5d}{flag}")
"""))

cells.append(md("## 4. Prepare stratified 70/15/15 split\n\nSame logic as `prepare_dataset.py` in the repo."))
cells.append(code("""import random, shutil, json, pathlib

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
RAW_DIR = pathlib.Path("data/raw")
OUT_DIR = pathlib.Path("data/processed")
SEED = 42

def split_files(files, seed):
    rng = random.Random(seed)
    shuffled = files[:]
    rng.shuffle(shuffled)
    n = len(shuffled)
    n_train = int(n * TRAIN_SPLIT)
    n_val = int(n * VAL_SPLIT)
    return {"train": shuffled[:n_train], "val": shuffled[n_train:n_train + n_val], "test": shuffled[n_train + n_val:]}

labels = []
for entry in PEST_DISEASE_CLASSES:
    label = entry["label"]
    source_dir = RAW_DIR / entry["source"] / entry["datasetLabel"]
    if not source_dir.exists():
        print(f"[skip] {label}: source directory not found: {source_dir}")
        continue
    files = [p for p in source_dir.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS]
    if not files:
        print(f"[skip] {label}: no images found in {source_dir}")
        continue
    splits = split_files(files, seed=SEED)
    for split_name, split_files_list in splits.items():
        dest_dir = OUT_DIR / split_name / label
        dest_dir.mkdir(parents=True, exist_ok=True)
        for src_path in split_files_list:
            shutil.copy2(src_path, dest_dir / src_path.name)
    labels.append(label)
    print(f"[ok] {label}: {len(files)} images (train={len(splits['train'])}, val={len(splits['val'])}, test={len(splits['test'])})")

labels_path = pathlib.Path("artifacts/labels.json")
labels_path.parent.mkdir(parents=True, exist_ok=True)
with open(labels_path, "w", encoding="utf-8") as f:
    json.dump({"version": "prepared-dataset", "labels": sorted(labels)}, f, indent=2)
print(f"\\nWrote {len(labels)} classes to {labels_path}")
"""))

cells.append(md("""## 5. Train (two-stage transfer learning, MobileNetV3-Large)

Same architecture/recipe as `train.py` in the repo. Batch size is bumped up
to 32 here (vs. 8 locally) since a Colab T4 has far more VRAM than a 2GB
laptop GPU — this alone should make each epoch several times faster."""))
cells.append(code("""import torch
import torch.nn as nn
from sklearn.metrics import f1_score
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
import pathlib, json

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
INPUT_SIZE = 224

BATCH_SIZE = 32
EPOCHS_STAGE1 = 5
EPOCHS_STAGE2 = 10
LR_STAGE1 = 1e-3
LR_STAGE2 = 1e-5
UNFREEZE_LAST_N_BLOCKS = 3
PATIENCE = 3
CHECKPOINT_DIR = pathlib.Path("artifacts")
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

def build_transforms():
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(INPUT_SIZE, scale=(0.7, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
        transforms.RandomApply([transforms.GaussianBlur(kernel_size=5)], p=0.3),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])
    eval_transform = transforms.Compose([
        transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])
    return train_transform, eval_transform

def build_model(num_classes):
    model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model

def set_backbone_trainable(model, trainable, unfreeze_last_n_blocks=0):
    for param in model.features.parameters():
        param.requires_grad = trainable
    if not trainable and unfreeze_last_n_blocks > 0:
        for block in list(model.features.children())[-unfreeze_last_n_blocks:]:
            for param in block.parameters():
                param.requires_grad = True

def compute_class_weights(dataset, num_classes):
    counts = torch.zeros(num_classes)
    for _, label in dataset.samples:
        counts[label] += 1
    counts = torch.clamp(counts, min=1)
    return counts.sum() / (num_classes * counts)

def run_epoch(model, loader, criterion, optimizer, device, train):
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

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Training on:", device)

train_transform, eval_transform = build_transforms()
train_ds = datasets.ImageFolder("data/processed/train", transform=train_transform)
val_ds = datasets.ImageFolder("data/processed/val", transform=eval_transform)
num_classes = len(train_ds.classes)
print(f"{num_classes} classes, {len(train_ds)} train images, {len(val_ds)} val images")

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)

model = build_model(num_classes).to(device)
class_weights = compute_class_weights(train_ds, num_classes).to(device)
criterion = nn.CrossEntropyLoss(weight=class_weights)

best_f1 = -1.0
epochs_without_improvement = 0

def maybe_checkpoint(macro_f1, stage, epoch):
    global best_f1, epochs_without_improvement
    if macro_f1 > best_f1:
        best_f1 = macro_f1
        epochs_without_improvement = 0
        torch.save(model.state_dict(), CHECKPOINT_DIR / "best_model.pt")
        print(f"  -> new best macro-F1 {macro_f1:.4f}, checkpoint saved ({stage} epoch {epoch})")
    else:
        epochs_without_improvement += 1

# Stage 1: freeze backbone, train classifier head only.
set_backbone_trainable(model, trainable=False)
optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LR_STAGE1)
for epoch in range(1, EPOCHS_STAGE1 + 1):
    train_loss, train_f1 = run_epoch(model, train_loader, criterion, optimizer, device, train=True)
    val_loss, val_f1 = run_epoch(model, val_loader, criterion, optimizer, device, train=False)
    print(f"[stage1 epoch {epoch}] train_loss={train_loss:.4f} train_f1={train_f1:.4f} val_loss={val_loss:.4f} val_f1={val_f1:.4f}")
    maybe_checkpoint(val_f1, "stage1", epoch)
    if epochs_without_improvement >= PATIENCE:
        print("Early stopping (stage 1)")
        break

# Stage 2: unfreeze last blocks, fine-tune at lower LR.
set_backbone_trainable(model, trainable=False, unfreeze_last_n_blocks=UNFREEZE_LAST_N_BLOCKS)
optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LR_STAGE2)
epochs_without_improvement = 0
for epoch in range(1, EPOCHS_STAGE2 + 1):
    train_loss, train_f1 = run_epoch(model, train_loader, criterion, optimizer, device, train=True)
    val_loss, val_f1 = run_epoch(model, val_loader, criterion, optimizer, device, train=False)
    print(f"[stage2 epoch {epoch}] train_loss={train_loss:.4f} train_f1={train_f1:.4f} val_loss={val_loss:.4f} val_f1={val_f1:.4f}")
    maybe_checkpoint(val_f1, "stage2", epoch)
    if epochs_without_improvement >= PATIENCE:
        print("Early stopping (stage 2)")
        break

with open(CHECKPOINT_DIR / "class_index.json", "w", encoding="utf-8") as f:
    json.dump(train_ds.classes, f, indent=2)

print(f"\\nTraining complete. Best validation macro-F1: {best_f1:.4f}")
"""))

cells.append(md("## 6. Evaluate on the held-out test set\n\nSame logic as `evaluate.py` — accuracy, macro-F1, per-class report, confusion matrix, worst classes."))
cells.append(code("""import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

eval_out_dir = pathlib.Path("artifacts/eval")
eval_out_dir.mkdir(parents=True, exist_ok=True)

test_ds = datasets.ImageFolder("data/processed/test", transform=eval_transform)
test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=2)
class_names = test_ds.classes

eval_model = build_model(len(class_names)).to(device)
eval_model.load_state_dict(torch.load(CHECKPOINT_DIR / "best_model.pt", map_location=device, weights_only=True))
eval_model.eval()

all_preds, all_labels = [], []
with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        outputs = eval_model(images)
        all_preds.extend(outputs.argmax(dim=1).cpu().tolist())
        all_labels.extend(labels.tolist())

accuracy = accuracy_score(all_labels, all_preds)
macro_f1 = f1_score(all_labels, all_preds, average="macro", zero_division=0)
report = classification_report(all_labels, all_preds, target_names=class_names, output_dict=True, zero_division=0)

print(f"Accuracy: {accuracy:.4f}")
print(f"Macro-F1: {macro_f1:.4f}\\n")

per_class_f1 = [(name, report[name]["f1-score"]) for name in class_names]
worst = sorted(per_class_f1, key=lambda x: x[1])[:8]
print("Worst-performing classes (lowest F1):")
for name, f1 in worst:
    print(f"  - {name}: F1={f1:.4f}, support={int(report[name]['support'])}")

cm = confusion_matrix(all_labels, all_preds)
fig, ax = plt.subplots(figsize=(max(10, len(class_names) * 0.5), max(10, len(class_names) * 0.5)))
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
fig.savefig(eval_out_dir / "confusion_matrix.png")
print(f"\\nConfusion matrix saved to {eval_out_dir / 'confusion_matrix.png'}")

summary = {"accuracy": accuracy, "macroF1": macro_f1, "perClass": report, "worstClasses": [{"label": n, "f1": f} for n, f in worst]}
with open(eval_out_dir / "evaluation_summary.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)
print(f"Full evaluation summary saved to {eval_out_dir / 'evaluation_summary.json'}")
"""))

cells.append(md("### Print raw confusion counts for any class you want to inspect\n\nUseful for understanding *which* classes get confused with which (not just the F1 number) — this is what revealed the caterpillar-species confusion in the 16-class tomato-only run. Edit `CLASSES_TO_INSPECT` below."))
cells.append(code("""CLASSES_TO_INSPECT = [name for name, f1 in worst]  # defaults to the worst-performing classes

for label in CLASSES_TO_INSPECT:
    i = class_names.index(label)
    row = cm[i]
    total = row.sum()
    mistakes = [(class_names[j], int(row[j])) for j in range(len(class_names)) if j != i and row[j] > 0]
    print(f"{label:35s} (n={total}): correct={row[i]}, misclassified_as={mistakes}")
"""))

cells.append(md("## 7. Export to TorchScript"))
cells.append(code("""import datetime

MODEL_VERSION = f"multicrop-{datetime.date.today().isoformat()}"

export_model = build_model(len(class_names))
export_model.load_state_dict(torch.load(CHECKPOINT_DIR / "best_model.pt", map_location="cpu", weights_only=True))
export_model.eval()

example_input = torch.randn(1, 3, 224, 224)
traced = torch.jit.trace(export_model, example_input)
traced.save(str(CHECKPOINT_DIR / "model.torchscript.pt"))

(CHECKPOINT_DIR / "model_version.txt").write_text(MODEL_VERSION, encoding="utf-8")
print(f"Exported {CHECKPOINT_DIR / 'model.torchscript.pt'}")
print(f"Model version: {MODEL_VERSION}")
"""))

cells.append(md("""## 8. Download the trained artifacts

Zips up everything needed to deploy this model, plus the full evaluation
report to copy into `EXPERIMENT_NOTES.md`. Unzip locally into
`ml-service/artifacts/` (the `.pt`/`.json`/`.txt` files) — keep
`eval/` alongside `training/data/processed_multicrop/eval/` in the repo for
the record."""))
cells.append(code("""import shutil
from google.colab import files

shutil.make_archive("trained_model", "zip", "artifacts")
files.download("trained_model.zip")
"""))

nb = {
    "cells": cells,
    "metadata": {
        "accelerator": "GPU",
        "colab": {"name": "manthulir_multicrop_training.ipynb", "provenance": []},
        "kernelspec": {"display_name": "Python 3", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

with open("manthulir_multicrop_training.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1)

print("Wrote manthulir_multicrop_training.ipynb with", len(cells), "cells")
