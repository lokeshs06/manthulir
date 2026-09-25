# Multi-crop disease + pest detection model — training run notes

**Latest run**: 2026-09-22 (33 classes: 5 crops — tomato, potato, bell
pepper, paddy/rice, brinjal/eggplant). **Training in progress / results
pending** — this section will be filled in once `evaluate.py` completes.
**Previous runs**: 2026-09-22 morning (16 tomato-only classes) and
2026-09-21 (8 tomato-disease-only classes) — both superseded, kept below
for history.

**Status**: previous 16-class tomato model is live in production
(`MOCK_MODEL=false`) as of this writing; this 33-class run will replace it
once trained, evaluated, and verified.

## What this covers, and what it still doesn't

33 classes across 5 crops:

| Crop | Diseases | Insects | Healthy |
|---|---|---|---|
| Tomato | 7 | 8 | 1 |
| Potato | 2 | — | 1 |
| Bell pepper | 1 | — | 1 |
| Paddy/rice | — | 6 | — |
| Brinjal/eggplant | 4 (+1 generic insect-damage) | — | 1 |

**Still genuinely uncovered after real effort** (not just "not tried"):

- **Okra diseases** — the one dataset found (Mendeley, "Okra DiseaseNet")
  organizes its files in nested folders that Mendeley's public file-listing
  API doesn't expose (root-level listing returns empty; no folder-traversal
  endpoint was discoverable after directly probing the API and the site's
  JS bundle).
- **Cotton pink bollworm** — the one "cotton disease dataset" found on
  Mendeley turned out to be a text-only CSV of disease descriptions, not an
  image dataset at all, despite search results describing it as covering
  "12 major cotton diseases."
- **Fall armyworm (maize)** — a real dataset exists (Mendeley's CCMT
  dataset, 5,389 real maize pest images) but has the same nested-folder
  access barrier as okra.
- **IP102 itself** — still unobtainable (Google Drive/Baidu hosting,
  ~19GB, no no-auth download path). This is the root cause of most of the
  above — IP102 would have covered all three in one dataset.

Two of the original 10 IP102-sourced placeholder classes (`aphids`,
`whiteflies`) are now superseded by real trained tomato-specific
equivalents. The remaining 8 (including the three above) are preserved,
unused, in `api/src/seed/data/pestRemedies.retired-insect-placeholders.js`.

## Data

All datasets are **CC BY 4.0** or equivalent open licenses, with citations
recorded in each `PestRemedy` seed entry's `sourceReferences` field.

**Tomato** — see "Previous runs" below for the original per-class table
(15,697 images, 16 classes: 8 diseases + 8 insects).

**Potato** (PlantVillage, same repo/pipeline as tomato):

| Class | Images |
|---|---|
| potato_early_blight | 1,000 |
| potato_late_blight | 1,000 |
| potato_healthy | 152 |

**Bell pepper** (PlantVillage):

| Class | Images |
|---|---|
| bell_pepper_bacterial_spot | 997 |
| bell_pepper_healthy | 1,478 |

**Paddy/rice pests** — ["Paddy Field Pest Image Dataset for Deep
Learning-Based Multi-Class Classification"](https://data.mendeley.com/datasets/y5hwbhrn5m/1),
Mendeley Data, doi:10.17632/y5hwbhrn5m.1, CC BY 4.0. Downloaded as
`Paddy.zip` → `original_data/` subset only (the zip also contains separate
`augmented_data` and `preprocessed_data` archives, not used — same
leakage-avoidance reasoning as the tomato pest dataset).

| Class | Images |
|---|---|
| paddy_brown_planthopper | 101 |
| paddy_green_leafhopper | 155 |
| paddy_leaf_folder | 166 |
| paddy_rice_bug | 152 |
| paddy_stem_borer | 172 |
| paddy_whorl_maggot | 87 |

Note: `paddy_stem_borer` is labeled generically (not "yellow stem borer"
specifically) because the dataset's own folder name ("Stemz_Borer") doesn't
specify species, and there are several visually similar rice stem borer
species — labeling it more specifically than the source data supports would
overclaim precision.

**Brinjal/eggplant** — ["Eggplant Leaf Disease Detection Dataset"](https://data.mendeley.com/datasets/d3ypkphghb/2),
Mendeley Data, doi:10.17632/d3ypkphghb.2, CC BY 4.0. Downloaded as a single
2.31GB zip → `Original Dataset/` subset only (an `Augmented Dataset/`
sibling folder exists in the same zip, not used, same reasoning).

| Class | Images |
|---|---|
| brinjal_healthy | 1,451 |
| brinjal_insect_pest_damage | 546 |
| brinjal_leaf_spot | 602 |
| brinjal_mosaic_virus | 1,362 |
| brinjal_white_mold | 63 |
| brinjal_wilt | 65 |

`brinjal_insect_pest_damage` is the dataset's own generic category for
visible insect-feeding symptoms — it is **not** a specific insect species
ID. A prediction of this label means "insect damage detected," not "this
insect species identified." See its `PestRemedy` entry for how the app
should present that distinction.

**Total across all 5 crops: ~25,200 images across 33 classes.**

### Why only "original" (non-augmented) subsets?

Every Mendeley dataset used here ships a pre-augmented copy of its images
alongside the originals (rotation/flip/crop applied to the same small
source set). Using the augmented copy and doing a random train/val/test
split would put near-duplicate images — the same source photo, just
rotated — on both sides of the split. That's a real data-leakage risk that
would inflate reported accuracy specifically on the smaller, harder
classes we most need an honest number for. Every dataset here was
downloaded in full, then only the `original`/non-augmented subset was
copied into `data/raw/` for splitting. `train.py`'s own runtime
augmentation (random crop, flip, rotation, color jitter, blur) provides
the augmentation instead, on a clean, leak-free split.

### PlantVillage caveat still applies

Disease images (tomato, potato, bell pepper) are lab-condition — clean
background, single leaf. Real farmer phone photos will likely score lower
on those classes than the numbers below.

## Training

- Model: MobileNetV3-Large (ImageNet-pretrained), two-stage transfer
  learning (`train.py`): 5 epochs frozen-backbone + up to 10 epochs
  fine-tuning the last 3 blocks, early stopping on validation macro-F1
  (patience 3).
- Hardware: NVIDIA GeForce MX550 (2GB VRAM laptop GPU), batch size 8.
- *(Results to be filled in once training and evaluation complete.)*

## Files

- `ml-service/training/class_config.py` — all 33 classes (label ↔ source
  dataset ↔ folder name mapping), with full provenance notes.
- `ml-service/training/data/raw/{plantvillage,tomato_pest_mendeley,paddy_pest_mendeley,brinjal_disease_mendeley}/` —
  raw downloaded images per source (not committed — see `.gitignore`).
- `ml-service/training/data/processed_multicrop/` — this run's prepared
  split, checkpoint, exported model, and eval report.
- `ml-service/training/data/processed_tomato_combined/` and
  `data/processed_tomato_disease/` — earlier runs' artifacts, superseded,
  kept for comparison.
- `api/src/seed/data/pestRemedies.data.js` — 15 tomato remedy entries,
  matching the model **currently deployed** in `ml-service/artifacts/`
  (16-class tomato-only). All `reviewedByExpert: false` — needs
  agronomist/KVK review before being treated as authoritative.
- `api/src/seed/data/pestRemedies.pending-multicrop.js` — 14 more entries
  (potato, bell pepper, paddy/rice, brinjal/eggplant) for this 33-class
  run, **staged but not yet active** — `modelClassLabel` must match a
  label the deployed model actually outputs, and that's still the 16-class
  model until this run's output is copied into `ml-service/artifacts/`.
  Merge this file into `pestRemedies.data.js` once it is deployed (see
  that file's own header comment for the exact steps); `tests/integration/seed.test.js`
  will catch it if this is done incorrectly. Each entry cites its source
  dataset in `sourceReferences` (CC BY 4.0 requires attribution).

## Reproducing or extending this

```bash
cd ml-service/training
python prepare_dataset.py --raw-dir data/raw --out-dir data/processed_multicrop --labels-out data/processed_multicrop/labels.json
python train.py --data-dir data/processed_multicrop --checkpoint-dir data/processed_multicrop/artifacts --epochs-stage1 5 --epochs-stage2 10 --batch-size 8 --patience 3
python evaluate.py --data-dir data/processed_multicrop --checkpoint data/processed_multicrop/artifacts/best_model.pt --out-dir data/processed_multicrop/eval
python export.py --checkpoint data/processed_multicrop/artifacts/best_model.pt --num-classes 33 --out-dir data/processed_multicrop/artifacts --model-version <new-version-string>
```

`--labels-out` on `prepare_dataset.py` is important — without it, the
script overwrites `ml-service/artifacts/labels.json` (the production file)
directly. Use it for any run that doesn't include the full production
class set.

**To add okra, cotton pink bollworm, or fall armyworm later**: these
weren't skipped for lack of trying — see "What this covers, and what it
still doesn't" above for exactly why each is currently blocked. The most
direct path for all three remains obtaining IP102 (needs a Google
account/manual download, or a mirror not yet found) or finding a
flat-file-structured alternative dataset the same way the paddy-pest and
brinjal datasets were found here.

### Known remaining risk: out-of-distribution inputs (unchanged from prior runs)

A disease-only precursor of this model was fed pure random noise (not a
leaf, not an insect, nothing in its training distribution) and confidently
(96%) misclassified it as `tomato_septoria_leaf_spot` — above the
confidence threshold that triggers a single "confident" diagnosis. This is
still a closed N-way classifier with no "none of the above" option, so a
photo of anything outside these 33 labels (a different crop entirely, an
unrelated object) can still be forced into one of them, potentially with
high confidence. Not addressed by this round of work — see the three
mitigation options discussed when this was first found (scope-limiting
messaging, a lightweight OOD guard, or leaving it as-is) if it needs
addressing.

---

## Previous runs (superseded)

### 2026-09-22 morning: 16 tomato-only classes (diseases + insects)

MobileNetV3-Large, 8 tomato diseases (PlantVillage, 15,080 images) + 8
tomato insect pests (Mendeley tomato-pest dataset, 617 images). **95.23%
test accuracy, but only 84.04% macro-F1** — insect classes (25-131 images)
dragged down the per-class average despite disease classes staying strong
(0.917-0.992 F1). Specific failure mode confirmed via raw confusion
counts: three visually similar caterpillar species
(`tomato_beet_armyworm`, `tomato_tobacco_cutworm`, `tomato_fruit_borer`)
were confused with each other 5+ times each, while visually distinct
insects (aphid, spider mite, whitefly, thrips, fruit fly) scored
0.63-1.00 F1 despite similarly tiny sample sizes. Verified end-to-end
through the live `/predict` endpoint. Artifacts kept at
`ml-service/training/data/processed_tomato_combined/`.

### 2026-09-21: 8 tomato-disease-only classes

Same architecture, disease classes only, 15,080 images. **98.28% test
accuracy, 97.72% macro-F1** — much higher than either later run because it
had no tiny insect classes dragging down macro-F1. Worst class was
`tomato_mosaic_virus` at F1 0.9580 (smallest disease class, 373 images).
Artifacts kept at `ml-service/training/data/processed_tomato_disease/`.
