"""
Merges selected IP102 and PlantVillage classes (see class_config.py) into a
single torchvision ImageFolder-compatible directory, with a stratified
70/15/15 train/val/test split, and writes labels.json.

This script does NOT download any dataset. Before running it:
  1. Download IP102 and PlantVillage yourself and place them under
     ml-service/training/data/raw/ip102/ and data/raw/plantvillage/
     (each dataset keeps its own original folder-per-class layout).
  2. Open class_config.py and fill in the exact `datasetLabel` folder name
     for every entry — those are placeholders and must be matched against
     each dataset's actual class list first.

Usage:
    python prepare_dataset.py --raw-dir data/raw --out-dir data/processed
"""

import argparse
import random
import shutil
from pathlib import Path

from class_config import PEST_DISEASE_CLASSES, TRAIN_SPLIT, VAL_SPLIT

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def find_source_dir(raw_dir: Path, entry: dict) -> Path:
    return raw_dir / entry["source"] / entry["datasetLabel"]


def split_files(files: list[Path], seed: int) -> dict[str, list[Path]]:
    rng = random.Random(seed)
    shuffled = files[:]
    rng.shuffle(shuffled)

    n = len(shuffled)
    n_train = int(n * TRAIN_SPLIT)
    n_val = int(n * VAL_SPLIT)

    return {
        "train": shuffled[:n_train],
        "val": shuffled[n_train : n_train + n_val],
        "test": shuffled[n_train + n_val :],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", default="data/raw")
    parser.add_argument("--out-dir", default="data/processed")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--labels-out",
        default=None,
        help="Where to write labels.json. Defaults to ml-service/artifacts/labels.json "
        "(the file the running inference service loads) — override this for any "
        "experiment/partial-class-set run so it doesn't overwrite production.",
    )
    args = parser.parse_args()

    raw_dir = Path(args.raw_dir)
    out_dir = Path(args.out_dir)

    labels = []
    skipped = []

    for entry in PEST_DISEASE_CLASSES:
        label = entry["label"]
        source_dir = find_source_dir(raw_dir, entry)

        if entry["datasetLabel"].startswith("TODO"):
            skipped.append((label, "datasetLabel not yet filled in — see class_config.py"))
            continue

        if not source_dir.exists():
            skipped.append((label, f"source directory not found: {source_dir}"))
            continue

        files = [p for p in source_dir.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS]
        if not files:
            skipped.append((label, f"no images found in {source_dir}"))
            continue

        splits = split_files(files, seed=args.seed)
        for split_name, split_files_list in splits.items():
            dest_dir = out_dir / split_name / label
            dest_dir.mkdir(parents=True, exist_ok=True)
            for src_path in split_files_list:
                shutil.copy2(src_path, dest_dir / src_path.name)

        labels.append(label)
        print(f"[ok] {label}: {len(files)} images "
              f"(train={len(splits['train'])}, val={len(splits['val'])}, test={len(splits['test'])})")

    if skipped:
        print("\nSkipped classes (fix class_config.py / download the dataset, then re-run):")
        for label, reason in skipped:
            print(f"  - {label}: {reason}")

    if args.labels_out:
        labels_path = Path(args.labels_out)
    else:
        labels_path = Path(__file__).resolve().parent.parent / "artifacts" / "labels.json"
    labels_path.parent.mkdir(parents=True, exist_ok=True)
    import json

    with open(labels_path, "w", encoding="utf-8") as f:
        json.dump({"version": "prepared-dataset", "labels": sorted(labels)}, f, indent=2, ensure_ascii=False)

    print(f"\nWrote {len(labels)} classes to {labels_path}")


if __name__ == "__main__":
    main()
