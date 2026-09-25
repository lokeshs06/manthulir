"""
Class list for the pest/disease detection model.

Growing multi-crop set, built up over several sessions — see
EXPERIMENT_NOTES.md for the full history and honest per-run results:

- 2026-09-21: 8 tomato leaf diseases + healthy (PlantVillage). 98.28% test
  accuracy standalone.
- 2026-09-22 (a): + 8 tomato insect pests (Mendeley Data "A database of
  eight common tomato pest images", Huang & Chuang 2020, CC BY 4.0,
  doi:10.17632/s62zm6djd2.1). Combined 16-class run: 95.23% accuracy but
  only 84.04% macro-F1 — insect classes (25-131 images) are far smaller
  than disease classes (373-5357) and drag down the per-class average.
- 2026-09-22 (b): + potato (3 classes) and bell pepper (2 classes) diseases
  (PlantVillage, same repo as tomato) + 6 rice/paddy insect pests (Mendeley
  Data "Paddy Field Pest Image Dataset", CC BY 4.0,
  doi:10.17632/y5hwbhrn5m.1) + brinjal/eggplant diseases (Mendeley Data,
  CC BY 4.0, doi:10.17632/d3ypkphghb.2).

Only ORIGINAL (non-augmented) images are used from any Mendeley dataset
that ships a separate pre-augmented file — augmented images are geometric
transforms (rotate/flip/crop) of the same small source set, and splitting
those across train/val/test would leak near-duplicates across the split and
inflate reported accuracy. `train.py`'s own runtime augmentation covers
rotation/flip/color-jitter/blur, so nothing is lost by starting from the
smaller original set.

Two of the original 10 IP102-sourced insect-pest placeholder classes
(`aphids`, `whiteflies`) are now superseded by real trained tomato-specific
equivalents here. The rest (cotton pink bollworm, fall armyworm, brinjal
fruit/shoot borer, okra diseases) remain genuinely unobtainable after
real effort in this environment — IP102 itself has no no-auth download
path, and the specific Mendeley datasets found for these either turned out
to be text-only (the "cotton diseases" dataset) or use a nested folder
structure Mendeley's public file-listing API doesn't expose (the okra and
CCMT maize-pest datasets). See
api/src/seed/data/pestRemedies.retired-insect-placeholders.js for what's
preserved for if that changes.

A trained model's output classes are fixed at export time, so this list
represents ALL classes for one combined model — you can't append classes
to an already-exported model without retraining from scratch on the union.
"""

# label: canonical class name matching ml-service/artifacts/labels.json
# source: which dataset it should be pulled from
# datasetLabel: the EXACT folder/class name in that dataset.
PEST_DISEASE_CLASSES = [
    {
        "label": "tomato_bacterial_spot",
        "source": "plantvillage",
        "datasetLabel": "Tomato___Bacterial_spot",
    },
    {
        "label": "tomato_early_blight",
        "source": "plantvillage",
        "datasetLabel": "Tomato___Early_blight",
    },
    {
        "label": "tomato_late_blight",
        "source": "plantvillage",
        "datasetLabel": "Tomato___Late_blight",
    },
    {
        "label": "tomato_leaf_mold",
        "source": "plantvillage",
        "datasetLabel": "Tomato___Leaf_Mold",
    },
    {
        "label": "tomato_septoria_leaf_spot",
        "source": "plantvillage",
        "datasetLabel": "Tomato___Septoria_leaf_spot",
    },
    {
        "label": "tomato_yellow_leaf_curl_virus",
        "source": "plantvillage",
        "datasetLabel": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    },
    {
        "label": "tomato_mosaic_virus",
        "source": "plantvillage",
        "datasetLabel": "Tomato___Tomato_mosaic_virus",
    },
    {
        "label": "tomato_healthy",
        "source": "plantvillage",
        "datasetLabel": "Tomato___healthy",
    },
    # Insect pests — Mendeley tomato pest dataset, folder codes are the
    # dataset authors' own species-initial abbreviations.
    {
        "label": "tomato_spider_mite",  # Tetranychus urticae
        "source": "tomato_pest_mendeley",
        "datasetLabel": "TU",
    },
    {
        "label": "tomato_whitefly",  # Bemisia argentifolii
        "source": "tomato_pest_mendeley",
        "datasetLabel": "BA",
    },
    {
        "label": "tomato_fruit_fly",  # Zeugodacus cucurbitae
        "source": "tomato_pest_mendeley",
        "datasetLabel": "ZC",
    },
    {
        "label": "tomato_thrips",  # Thrips palmi
        "source": "tomato_pest_mendeley",
        "datasetLabel": "TP",
    },
    {
        "label": "tomato_aphid",  # Myzus persicae
        "source": "tomato_pest_mendeley",
        "datasetLabel": "MP",
    },
    {
        "label": "tomato_tobacco_cutworm",  # Spodoptera litura
        "source": "tomato_pest_mendeley",
        "datasetLabel": "SL",
    },
    {
        "label": "tomato_beet_armyworm",  # Spodoptera exigua
        "source": "tomato_pest_mendeley",
        "datasetLabel": "SE",
    },
    {
        "label": "tomato_fruit_borer",  # Helicoverpa armigera
        "source": "tomato_pest_mendeley",
        "datasetLabel": "HA",
    },
    # Potato diseases — PlantVillage (same repo/source key as tomato).
    {
        "label": "potato_early_blight",
        "source": "plantvillage",
        "datasetLabel": "Potato___Early_blight",
    },
    {
        "label": "potato_late_blight",
        "source": "plantvillage",
        "datasetLabel": "Potato___Late_blight",
    },
    {
        "label": "potato_healthy",
        "source": "plantvillage",
        "datasetLabel": "Potato___healthy",
    },
    # Bell pepper diseases — PlantVillage.
    {
        "label": "bell_pepper_bacterial_spot",
        "source": "plantvillage",
        "datasetLabel": "Pepper,_bell___Bacterial_spot",
    },
    {
        "label": "bell_pepper_healthy",
        "source": "plantvillage",
        "datasetLabel": "Pepper,_bell___healthy",
    },
    # Rice/paddy insect pests — Mendeley "Paddy Field Pest Image Dataset"
    # (doi:10.17632/y5hwbhrn5m.1), original_data/ subset only (see module
    # docstring re: avoiding the augmented-file leakage risk).
    {
        "label": "paddy_brown_planthopper",
        "source": "paddy_pest_mendeley",
        "datasetLabel": "Brown_Planthopper",
    },
    {
        "label": "paddy_green_leafhopper",
        "source": "paddy_pest_mendeley",
        "datasetLabel": "Green_Leafhoppers",
    },
    {
        "label": "paddy_leaf_folder",
        "source": "paddy_pest_mendeley",
        "datasetLabel": "LEAF_FOLDERS",
    },
    {
        "label": "paddy_rice_bug",
        "source": "paddy_pest_mendeley",
        "datasetLabel": "Rice_Bug",
    },
    {
        "label": "paddy_stem_borer",
        "source": "paddy_pest_mendeley",
        "datasetLabel": "Stemz_Borer",
    },
    {
        "label": "paddy_whorl_maggot",
        "source": "paddy_pest_mendeley",
        "datasetLabel": "Whorl_Maggot",
    },
    # Brinjal/eggplant diseases — Mendeley "Eggplant Leaf Disease Detection
    # Dataset" (doi:10.17632/d3ypkphghb.2), Original Dataset/ subset only.
    # "brinjal_insect_pest_damage" is the dataset's own generic category for
    # visible insect-feeding damage, not a specific insect species — treat
    # predictions of this label as "insect damage present," not a species ID.
    {
        "label": "brinjal_healthy",
        "source": "brinjal_disease_mendeley",
        "datasetLabel": "Healthy Leaf",
    },
    {
        "label": "brinjal_insect_pest_damage",
        "source": "brinjal_disease_mendeley",
        "datasetLabel": "Insect Pest Disease",
    },
    {
        "label": "brinjal_leaf_spot",
        "source": "brinjal_disease_mendeley",
        "datasetLabel": "Leaf Spot Disease",
    },
    {
        "label": "brinjal_mosaic_virus",
        "source": "brinjal_disease_mendeley",
        "datasetLabel": "Mosaic Virus Disease",
    },
    {
        "label": "brinjal_white_mold",
        "source": "brinjal_disease_mendeley",
        "datasetLabel": "White Mold Disease",
    },
    {
        "label": "brinjal_wilt",
        "source": "brinjal_disease_mendeley",
        "datasetLabel": "Wilt Disease",
    },
]

# Stratified split ratios used by prepare_dataset.py
TRAIN_SPLIT = 0.70
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15
