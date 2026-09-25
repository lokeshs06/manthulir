// Seed data for organic/natural pest & disease remedies. Every entry is
// `reviewedByExpert: false` — this content MUST be reviewed by an agronomist
// or Krishi Vigyan Kendra (KVK) expert before being relied on for real
// treatment decisions. modelClassLabel values match ml-service/artifacts/labels.json.
//
// These 15 tomato_* entries (7 diseases + 8 insect pests) match the model
// currently deployed in ml-service/artifacts/ (16 classes: these 15 +
// tomato_healthy, which has no remedy) — see
// ml-service/training/EXPERIMENT_NOTES.md for per-class results.
//
// 14 more entries (potato, bell pepper, paddy/rice, brinjal/eggplant) are
// staged in pestRemedies.pending-multicrop.js, NOT here — they back a
// 33-class multi-crop model trained via
// ml-service/training/colab/manthulir_multicrop_training.ipynb that
// hasn't been deployed yet. Once it is (its output copied into
// ml-service/artifacts/), merge that file's array into this one.
//
// The original 10 IP102-sourced insect-pest placeholder entries were
// retired to pestRemedies.retired-insect-placeholders.js: they never had
// real training data behind them (IP102 remains unobtainable in this
// environment after repeated attempts) and modelClassLabel must match an
// actual model output, so keeping them in the seeded set would have been
// misleading.
export const pestRemediesSeedData = [
  {
    modelClassLabel: 'tomato_bacterial_spot',
    pestName: 'Bacterial Spot',
    pestNameTa: 'பாக்டீரியா இலைப்புள்ளி நோய்',
    scientificName: 'Xanthomonas perforans (syn. X. campestris pv. vesicatoria)',
    problemType: 'disease',
    affectedCrops: ['tomato'],
    symptoms:
      'Small, dark, water-soaked spots on leaves that turn brown with a yellow halo; spots on fruit are raised and scab-like.',
    symptomsTa:
      'இலைகளில் சிறிய, கருமையான, நீர் தோய்ந்த புள்ளிகள் பழுப்பு நிறமாகி மஞ்சள் வளையம் தோன்றும்; காய்களில் தடிப்பான புண் போன்ற புள்ளிகள்.',
    lifecycle: 'Bacteria survive in seed, infected debris, and volunteer plants; spread by splashing water, rain, and handling wet foliage.',
    damageStage: 'Any growth stage; worse in warm, humid, rainy weather',
    organicTreatments: [
      {
        method: 'Copper-based spray (Bordeaux mixture)',
        methodTa: 'செம்பு அடிப்படையிலான தெளிப்பு (போர்டோ கலவை)',
        ingredients: ['copper sulfate', 'hydrated lime', 'water'],
        preparationSteps: [
          'Dissolve 100g copper sulfate in 8L water in a plastic/earthen vessel',
          'Separately slake 100g lime in 2L water',
          'Slowly pour the copper solution into the lime solution while stirring (never the reverse) to make 1% Bordeaux mixture',
          'Use fresh; spray within a few hours of preparation',
        ],
        preparationStepsTa: [
          '100கிராம் காப்பர் சல்பேட்டை 8லிட்டர் தண்ணீரில் பிளாஸ்டிக்/மண் பாத்திரத்தில் கரைக்கவும்',
          'தனியாக 100கிராம் சுண்ணாம்பை 2லிட்டர் தண்ணீரில் கரைக்கவும்',
          'காப்பர் கரைசலை சுண்ணாம்பு கரைசலில் மெதுவாக ஊற்றி (எதிர்மாறாக அல்ல) கிளறவும் — 1% போர்டோ கலவை தயார்',
          'தயார் செய்த சிறிது நேரத்தில் தெளிக்கவும்',
        ],
        applicationFrequency: 'Every 7-10 days, starting at first symptoms',
        precautions: 'Avoid metal containers/sprayers (corrodes); do not spray during flowering if pollinators are active; do not mix with other sprays.',
      },
      {
        method: 'Seed and tool sanitation',
        methodTa: 'விதை மற்றும் கருவி சுத்திகரிப்பு',
        ingredients: ['hot water (for seed treatment)', 'disinfected tools'],
        preparationSteps: [
          'Treat seed in hot water at 50°C for 25 minutes before sowing (if saving own seed)',
          'Avoid working in the field when foliage is wet',
          'Disinfect stakes, ties, and tools between plots',
        ],
        preparationStepsTa: [
          'சொந்த விதை சேமிக்கும்போது, விதைத்தலுக்கு முன் 50°C வெந்நீரில் 25 நிமிடங்கள் விதையை நனைக்கவும்',
          'இலைகள் ஈரமாக இருக்கும்போது வயலில் வேலை செய்வதை தவிர்க்கவும்',
          'கழிகள், கட்டுகள், கருவிகளை பயிர் தொகுதிகளுக்கு இடையே கிருமி நீக்கம் செய்யவும்',
        ],
        applicationFrequency: 'Once before sowing; ongoing field hygiene',
        precautions: 'Bacteria spread readily on wet foliage — time all field operations for dry conditions.',
      },
    ],
    preventiveMeasures: [
      'Use disease-free/certified seed and resistant varieties where available',
      'Rotate out of tomato/pepper family for 2 years',
      'Use drip irrigation instead of overhead sprinklers',
      'Stake plants and space widely for airflow',
    ],
    severity: 'medium',
    sourceReferences: [],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_early_blight',
    pestName: 'Early Blight',
    pestNameTa: 'ஆரம்பகால கருகல் நோய்',
    scientificName: 'Alternaria solani',
    problemType: 'disease',
    affectedCrops: ['tomato'],
    symptoms:
      'Dark brown spots with concentric rings ("target spot") on older/lower leaves first, surrounded by yellowing; can girdle stems and blemish fruit near the stem end.',
    symptomsTa: 'கீழ் பழைய இலைகளில் வட்ட வளையங்களுடன் (இலக்கு புள்ளி போன்று) கரும்பழுப்பு புள்ளிகள், சுற்றிலும் மஞ்சளாதல்; தண்டையும் காய் காம்பு பகுதியையும் பாதிக்கலாம்.',
    lifecycle: 'Fungus survives in infected debris and soil; spreads by wind, rain splash, and irrigation water; favored by warm, humid weather and plant stress.',
    damageStage: 'From seedling to fruiting stage; older leaves affected first',
    organicTreatments: [
      {
        method: 'Trichoderma viride soil and foliar application',
        methodTa: 'ட்ரைக்கோடெர்மா விரிடி மண்/இலை பயன்பாடு',
        ingredients: ['Trichoderma viride formulation', 'well-rotted FYM (for soil application)', 'water (for foliar spray)'],
        preparationSteps: [
          'Mix Trichoderma viride at 5g/L water for a foliar spray, or 2.5kg/acre mixed with FYM for soil application',
          'Apply to soil at transplanting, then spray foliage every 15 days',
        ],
        preparationStepsTa: [
          'இலை தெளிப்புக்கு 5கிராம்/லிட்டர் தண்ணீரில் ட்ரைக்கோடெர்மா விரிடியை கலக்கவும், அல்லது மண் பயன்பாட்டிற்கு ஏக்கருக்கு 2.5கிலோவை தொழு உரத்துடன் கலக்கவும்',
          'நடவு செய்யும்போது மண்ணில் இடவும், பின் ஒவ்வொரு 15 நாட்களுக்கும் இலைகளில் தெளிக்கவும்',
        ],
        applicationFrequency: 'Every 15 days as a preventive; do not mix with copper/chemical fungicides (kills the biocontrol agent)',
        precautions: 'Store the formulation away from direct sunlight and heat; keep it away from fungicide contact.',
      },
      {
        method: 'Copper-based spray (Bordeaux mixture)',
        methodTa: 'செம்பு அடிப்படையிலான தெளிப்பு (போர்டோ கலவை)',
        ingredients: ['copper sulfate', 'hydrated lime', 'water'],
        preparationSteps: [
          'Prepare 1% Bordeaux mixture (100g copper sulfate + 100g lime in 10L water, mixing copper into lime)',
          'Spray at first sign of lower-leaf spotting',
        ],
        preparationStepsTa: [
          '1% போர்டோ கலவை தயாரிக்கவும் (100கிராம் காப்பர் சல்பேட் + 100கிராம் சுண்ணாம்பு 10லிட்டர் தண்ணீரில்)',
          'கீழ் இலைகளில் புள்ளிகள் தோன்றியவுடன் தெளிக்கவும்',
        ],
        applicationFrequency: 'Every 7-10 days during humid weather',
        precautions: 'Do not combine with Trichoderma applications in the same week.',
      },
    ],
    preventiveMeasures: [
      'Remove and destroy infected lower leaves and crop debris after harvest',
      'Mulch to prevent soil splash onto lower leaves',
      'Rotate out of tomato/potato family for 2-3 years',
      'Avoid overhead irrigation; water at the base',
    ],
    severity: 'medium',
    sourceReferences: [],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_late_blight',
    pestName: 'Late Blight',
    pestNameTa: 'பிற்பட்ட கருகல் நோய்',
    scientificName: 'Phytophthora infestans',
    problemType: 'disease',
    affectedCrops: ['tomato', 'potato'],
    symptoms:
      'Large, irregular water-soaked patches on leaves that turn brown/black, often with white fungal growth on the underside in humid conditions; can destroy a crop within days in cool, wet weather.',
    symptomsTa: 'இலைகளில் பெரிய, ஒழுங்கற்ற நீர் தோய்ந்த திட்டுகள் பழுப்பு/கருமையாக மாறுதல்; ஈரப்பதத்தில் இலையின் அடிப்பகுதியில் வெள்ளை பூஞ்சை வளர்ச்சி; குளிர்ந்த ஈரமான வானிலையில் சில நாட்களில் பயிரை அழிக்கக்கூடும்.',
    lifecycle:
      'Spreads extremely fast via windborne spores in cool, wet, humid conditions (this is the pathogen behind the Irish potato famine); survives in infected tubers/debris.',
    damageStage: 'Any stage; spreads fastest in cool (15-20°C), wet, humid weather',
    organicTreatments: [
      {
        method: 'Copper-based spray (preventive, before rain)',
        methodTa: 'செம்பு அடிப்படையிலான தெளிப்பு (மழைக்கு முன் தடுப்பு)',
        ingredients: ['copper oxychloride or copper hydroxide (organic-permitted copper fungicide)', 'water'],
        preparationSteps: [
          'Mix copper oxychloride at 3g/L water',
          'Spray thoroughly to cover both leaf surfaces before forecasted rain/humid spells',
        ],
        preparationStepsTa: [
          '3கிராம்/லிட்டர் தண்ணீரில் காப்பர் ஆக்ஸிகுளோரைடை கலக்கவும்',
          'மழை/ஈரப்பதம் வருவதற்கு முன் இலையின் இருபுறமும் நன்கு தெளிக்கவும்',
        ],
        applicationFrequency: 'Every 5-7 days during cool, wet weather — this disease needs preventive, not reactive, spraying',
        precautions:
          'Once late blight is well established, organic copper sprays slow but may not stop it — remove and destroy infected plants immediately to protect the rest of the field.',
      },
      {
        method: 'Remove and destroy infected plants',
        methodTa: 'பாதிக்கப்பட்ட செடிகளை அகற்றி அழித்தல்',
        ingredients: [],
        preparationSteps: ['Pull out and burn or bury (not compost) severely infected plants immediately', 'Do this on dry days to avoid spreading spores'],
        preparationStepsTa: [
          'கடுமையாக பாதிக்கப்பட்ட செடிகளை உடனடியாக பிடுங்கி எரிக்கவும் அல்லது புதைக்கவும் (உரம் ஆக்க வேண்டாம்)',
          'வித்திகள் பரவாமல் இருக்க வறண்ட நாட்களில் இதை செய்யவும்',
        ],
        applicationFrequency: 'Immediately on detection',
        precautions: 'This disease can wipe out a field fast — act the same day symptoms are confirmed.',
      },
    ],
    preventiveMeasures: [
      'Use certified disease-free seedlings/tubers and resistant varieties where available',
      'Avoid overhead irrigation and working fields when foliage is wet',
      'Ensure good drainage and airflow (wide spacing, staking)',
      'Do not plant near infected potato fields',
    ],
    severity: 'high',
    sourceReferences: [],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_leaf_mold',
    pestName: 'Leaf Mold',
    pestNameTa: 'இலை பூஞ்சை நோய்',
    scientificName: 'Passalora fulva (syn. Fulvia fulva, Cladosporium fulvum)',
    problemType: 'disease',
    affectedCrops: ['tomato'],
    symptoms:
      'Pale yellow-green spots on the upper leaf surface with olive-green to grayish-purple velvety mold on the underside; common in polyhouses/greenhouses and dense, humid canopies.',
    symptomsTa: 'இலையின் மேற்பரப்பில் வெளிர் மஞ்சள்-பச்சை புள்ளிகள்; அடிப்பகுதியில் ஆலிவ்-பச்சை முதல் சாம்பல்-ஊதா நிற பூஞ்சை படலம்; பாலிஹவுஸ்/பசுமை இல்லங்களில் அதிகம்.',
    lifecycle: 'Favored by high humidity (>85%) and poor air circulation, common under greenhouse/polyhouse cultivation; spreads by airborne spores.',
    damageStage: 'Established plants in dense, humid canopies',
    organicTreatments: [
      {
        method: 'Improve ventilation and reduce humidity',
        methodTa: 'காற்றோட்டத்தை மேம்படுத்தி ஈரப்பதத்தை குறைத்தல்',
        ingredients: [],
        preparationSteps: [
          'Prune lower leaves and suckers to open up the canopy',
          'Increase plant spacing; ventilate polyhouses/greenhouses more (open vents, use fans)',
          'Water at the base in the morning so foliage dries during the day',
        ],
        preparationStepsTa: [
          'கீழ் இலைகள் மற்றும் தளிர்களை நறுக்கி விதானத்தை திறக்கவும்',
          'செடிகளுக்கு இடையே இடைவெளியை அதிகரிக்கவும்; பாலிஹவுஸ்/பசுமை இல்லங்களில் காற்றோட்டத்தை மேம்படுத்தவும்',
          'காலையில் அடிப்பகுதியில் நீர் பாய்ச்சவும், பகலில் இலைகள் உலரட்டும்',
        ],
        applicationFrequency: 'Ongoing cultural practice',
        precautions: 'This is the single most effective control — humidity management matters more than any spray for this disease.',
      },
      {
        method: 'Copper or Trichoderma-based spray',
        methodTa: 'செம்பு அல்லது ட்ரைக்கோடெர்மா அடிப்படையிலான தெளிப்பு',
        ingredients: ['copper oxychloride (3g/L) or Trichoderma viride (5g/L)', 'water'],
        preparationSteps: ['Mix and spray thoroughly on both leaf surfaces, especially undersides where mold forms'],
        preparationStepsTa: ['இலையின் இருபுறமும், குறிப்பாக பூஞ்சை உருவாகும் அடிப்பகுதியில், நன்கு கலந்து தெளிக்கவும்'],
        applicationFrequency: 'Every 7-10 days at first symptoms',
        precautions: 'Do not apply copper and Trichoderma in the same application.',
      },
    ],
    preventiveMeasures: [
      'Choose resistant varieties where available, especially under protected cultivation',
      'Avoid overcrowding; stake and prune for airflow',
      'Remove and destroy infected leaves promptly',
    ],
    severity: 'low',
    sourceReferences: [],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_septoria_leaf_spot',
    pestName: 'Septoria Leaf Spot',
    pestNameTa: 'செப்டோரியா இலைப்புள்ளி நோய்',
    scientificName: 'Septoria lycopersici',
    problemType: 'disease',
    affectedCrops: ['tomato'],
    symptoms:
      'Small, circular spots with dark margins and light gray/tan centers, often with tiny black specks (fruiting bodies) visible in the center; starts on older/lower leaves and moves upward.',
    symptomsTa: 'இருண்ட விளிம்புகள் மற்றும் வெளிர் சாம்பல்/மங்கல் நிற மையத்துடன் சிறிய வட்ட புள்ளிகள்; மையத்தில் சிறிய கருப்பு புள்ளிகள் தெரியலாம்; கீழ் பழைய இலைகளில் தொடங்கி மேலே பரவும்.',
    lifecycle: 'Survives in infected debris and weeds (especially nightshade family); spreads by rain splash and wet foliage; favored by warm, humid, wet conditions.',
    damageStage: 'From early vegetative stage onward; worsens through the season if unmanaged',
    organicTreatments: [
      {
        method: 'Copper-based spray (Bordeaux mixture)',
        methodTa: 'செம்பு அடிப்படையிலான தெளிப்பு (போர்டோ கலவை)',
        ingredients: ['copper sulfate', 'hydrated lime', 'water'],
        preparationSteps: [
          'Prepare 1% Bordeaux mixture (100g copper sulfate + 100g lime in 10L water)',
          'Spray at first sign of lower-leaf spotting, covering undersides of leaves',
        ],
        preparationStepsTa: [
          '1% போர்டோ கலவை தயாரிக்கவும் (100கிராம் காப்பர் சல்பேட் + 100கிராம் சுண்ணாம்பு 10லிட்டர் தண்ணீரில்)',
          'கீழ் இலைகளில் புள்ளிகள் தோன்றியவுடன், இலையின் அடிப்பகுதி உட்பட தெளிக்கவும்',
        ],
        applicationFrequency: 'Every 7-10 days during warm, humid weather',
        precautions: 'Remove heavily spotted leaves before spraying so the spray reaches remaining healthy tissue.',
      },
      {
        method: 'Sanitation and crop debris removal',
        methodTa: 'சுத்தம் மற்றும் பயிர் எச்சங்களை அகற்றுதல்',
        ingredients: [],
        preparationSteps: [
          'Remove and destroy infected lower leaves as soon as spotted',
          'Clear and destroy all crop debris after harvest (do not compost)',
          'Control nightshade family weeds around the field',
        ],
        preparationStepsTa: [
          'புள்ளிகள் தோன்றியவுடன் பாதிக்கப்பட்ட கீழ் இலைகளை அகற்றி அழிக்கவும்',
          'அறுவடைக்குப் பின் அனைத்து பயிர் எச்சங்களையும் அகற்றி அழிக்கவும் (உரம் ஆக்க வேண்டாம்)',
          'வயலைச் சுற்றி களைகளை கட்டுப்படுத்தவும்',
        ],
        applicationFrequency: 'Ongoing through the season',
        precautions: 'The fungus overwinters in debris — thorough field sanitation after harvest matters as much as in-season spraying.',
      },
    ],
    preventiveMeasures: [
      'Mulch to prevent soil splash onto lower leaves',
      'Stake plants and space widely for airflow',
      'Rotate out of tomato/potato family for 2 years',
      'Avoid overhead irrigation; water at the base',
    ],
    severity: 'medium',
    sourceReferences: [],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_yellow_leaf_curl_virus',
    pestName: 'Tomato Yellow Leaf Curl Virus (TYLCV)',
    pestNameTa: 'தக்காளி மஞ்சள் இலை சுருள் வைரஸ் நோய்',
    scientificName: 'Tomato yellow leaf curl virus (Begomovirus), transmitted by whitefly (Bemisia tabaci)',
    problemType: 'disease',
    affectedCrops: ['tomato'],
    symptoms:
      'Upward curling and yellowing of leaflet margins, stunted/bushy growth, flower drop and drastically reduced fruiting; young plants infected early may never fruit.',
    symptomsTa: 'இலை ஓரங்கள் மேல்நோக்கி சுருண்டு மஞ்சளாதல்; குட்டையான/புதர் போன்ற வளர்ச்சி; பூக்கள் உதிர்தல் மற்றும் காய்ப்பு கடுமையாக குறைதல்; இளம் செடிகள் ஆரம்பத்திலேயே பாதிக்கப்பட்டால் காய்க்காமல் போகலாம்.',
    lifecycle: 'Not seed- or mechanically transmitted; spread entirely by whitefly (Bemisia tabaci) feeding — controlling the vector is the only practical organic control.',
    damageStage: 'Most damaging when infection occurs at the seedling/early transplant stage',
    organicTreatments: [
      {
        method: 'Whitefly vector control (yellow sticky traps + neem oil)',
        methodTa: 'வெள்ளை ஈ கட்டுப்பாடு (மஞ்சள் ஒட்டும் பொறிகள் + வேப்ப எண்ணெய்)',
        ingredients: ['yellow sticky traps', 'neem oil (1500 ppm)', 'mild soap', 'water'],
        preparationSteps: [
          'Install 10-12 yellow sticky traps per acre from the nursery stage onward',
          'Mix 5ml neem oil with a few drops of soap in 1L water and spray on leaf undersides every 7 days',
          'Use insect-proof nylon net covers over nursery seedbeds to prevent early infection',
        ],
        preparationStepsTa: [
          'நாற்றங்கால் நிலையிலிருந்தே ஏக்கருக்கு 10-12 மஞ்சள் ஒட்டும் பொறிகளை நிறுவவும்',
          '5மிலி வேப்ப எண்ணெயை சிறிதளவு சோப்புடன் 1லிட்டர் தண்ணீரில் கலந்து, ஒவ்வொரு 7 நாட்களுக்கும் இலையின் அடிப்பகுதியில் தெளிக்கவும்',
          'ஆரம்பகால பாதிப்பை தடுக்க நாற்றங்கால் மேல் பூச்சி தடுப்பு வலைகளை பயன்படுத்தவும்',
        ],
        applicationFrequency: 'Every 7 days; traps monitored continuously',
        precautions: 'This virus has no cure once a plant is infected — prevention via vector control is the only real option.',
      },
      {
        method: 'Remove and destroy infected plants; reflective mulch',
        methodTa: 'பாதிக்கப்பட்ட செடிகளை அகற்றி அழித்தல்; பிரதிபலிப்பு மல்ச்சிங்',
        ingredients: ['reflective/silver plastic mulch'],
        preparationSteps: [
          'Rogue out and destroy infected plants as soon as symptoms are seen, to reduce the source of infection for whiteflies to spread further',
          'Use silver/reflective plastic mulch on beds, which repels whiteflies',
        ],
        preparationStepsTa: [
          'அறிகுறிகள் தெரிந்தவுடன் பாதிக்கப்பட்ட செடிகளை பிடுங்கி அழிக்கவும், இது வெள்ளை ஈக்கள் மேலும் பரப்புவதை குறைக்கும்',
          'வெள்ளை ஈக்களை விரட்ட வெள்ளி/பிரதிபலிப்பு பிளாஸ்டிக் மல்ச்சை பயன்படுத்தவும்',
        ],
        applicationFrequency: 'Immediately on detection; mulch laid at transplanting',
        precautions: 'Do not delay removal of infected plants — they are an ongoing source of whitefly-transmitted spread to healthy plants.',
      },
    ],
    preventiveMeasures: [
      'Use TYLCV-tolerant/resistant varieties where available',
      'Raise seedlings under insect-proof net in the nursery',
      'Avoid planting near older, whitefly-infested tomato/cotton/cucurbit fields',
      'Time planting to avoid peak whitefly season where local KVK advises',
    ],
    severity: 'high',
    sourceReferences: [],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_mosaic_virus',
    pestName: 'Tomato Mosaic Virus (ToMV)',
    pestNameTa: 'தக்காளி மொசைக் வைரஸ் நோய்',
    scientificName: 'Tomato mosaic virus (Tobamovirus)',
    problemType: 'disease',
    affectedCrops: ['tomato'],
    symptoms:
      'Light and dark green mottled/mosaic pattern on leaves, leaf distortion/fern-like narrowing, stunted growth, and internal brown streaking or uneven ripening on fruit.',
    symptomsTa: 'இலைகளில் வெளிர்-கரும் பச்சை கலப்பு (மொசைக்) தோற்றம்; இலை உருமாற்றம்/குறுகுதல்; வளர்ச்சி குன்றுதல்; காயில் உள்ளக பழுப்பு கோடுகள் அல்லது சீரற்ற பழுத்தல்.',
    lifecycle:
      'Extremely stable and long-lived virus — spreads via contaminated tools, hands, infected seed, and by contact between plants (including from handling tobacco products, which carry a related virus); not insect-transmitted.',
    damageStage: 'Any stage; early infection causes the most yield loss',
    organicTreatments: [
      {
        method: 'Tool and hand sanitation',
        methodTa: 'கருவி மற்றும் கை சுத்திகரிப்பு',
        ingredients: ['trisodium phosphate (TSP) solution or dilute milk solution', 'water'],
        preparationSteps: [
          'Dip pruning tools and stakes in a 10% trisodium phosphate solution (or a 20% skim milk solution) between plants to inactivate the virus',
          'Wash hands with soap before handling plants, especially after touching tobacco products',
          'Avoid working with wet foliage, which spreads sap-borne virus particles by touch',
        ],
        preparationStepsTa: [
          'செடிகளுக்கு இடையே கருவிகள் மற்றும் கழிகளை 10% ட்ரைசோடியம் பாஸ்பேட் கரைசலில் (அல்லது 20% பாலாடைக் கரைசலில்) நனைத்து வைரஸை செயலிழக்க வைக்கவும்',
          'செடிகளை தொடுவதற்கு முன், குறிப்பாக புகையிலை பொருட்களை தொட்ட பிறகு, சோப்புடன் கைகளை கழுவவும்',
          'ஈரமான இலைகளுடன் வேலை செய்வதை தவிர்க்கவும் — தொடுதலால் வைரஸ் பரவும்',
        ],
        applicationFrequency: 'Every time tools move between plants; ongoing hand hygiene',
        precautions: 'There is no cure once infected — sanitation is entirely about preventing spread to healthy plants, not curing infected ones.',
      },
      {
        method: 'Remove and destroy infected plants; use certified virus-free seed',
        methodTa: 'பாதிக்கப்பட்ட செடிகளை அகற்றுதல்; வைரஸ் இல்லா சான்றளிக்கப்பட்ட விதை பயன்படுத்துதல்',
        ingredients: ['certified/hot-water-treated seed'],
        preparationSteps: [
          'Rogue out and destroy (do not compost) infected plants as soon as identified',
          'Source certified disease-free seed, or treat home-saved seed in hot water (50°C for 25 minutes) before sowing',
        ],
        preparationStepsTa: [
          'கண்டறிந்தவுடன் பாதிக்கப்பட்ட செடிகளை பிடுங்கி அழிக்கவும் (உரம் ஆக்க வேண்டாம்)',
          'சான்றளிக்கப்பட்ட நோய் இல்லா விதையை பயன்படுத்தவும், அல்லது சொந்த விதையை விதைப்பதற்கு முன் 50°C வெந்நீரில் 25 நிமிடங்கள் நனைக்கவும்',
        ],
        applicationFrequency: 'Immediately on detection; seed treatment once before sowing',
        precautions: 'Handle tobacco products away from the field/seedlings entirely if possible — this is a well-documented source of introduction.',
      },
    ],
    preventiveMeasures: [
      'Use certified virus-free or hot-water-treated seed',
      'Use resistant varieties (Tm resistance genes) where available',
      'Disinfect tools and hands between plants, especially after tobacco contact',
      'Avoid working fields when foliage is wet',
    ],
    severity: 'medium',
    sourceReferences: [],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_spider_mite',
    pestName: 'Two-Spotted Spider Mite',
    pestNameTa: 'இரு புள்ளி சிலந்தி நுளம்பு',
    scientificName: 'Tetranychus urticae',
    problemType: 'insect',
    affectedCrops: ['tomato', 'vegetables', 'cotton'],
    symptoms:
      'Fine yellow/white stippling (speckling) on upper leaf surface; fine silken webbing on undersides in heavy infestations; leaves turn bronze/yellow and drop. Thrives in hot, dry weather.',
    symptomsTa: 'இலையின் மேற்பரப்பில் நுண்ணிய மஞ்சள்/வெள்ளை புள்ளிகள்; அதிக பாதிப்பில் அடிப்பகுதியில் மெல்லிய வலை; இலைகள் வெண்கல நிறமாகி உதிர்தல். வெப்பமான, வறண்ட வானிலையில் அதிகரிக்கும்.',
    lifecycle: 'Rapid lifecycle (as little as 5-7 days in hot weather); nymphs and adults feed on the underside of leaves, piercing cells to feed.',
    damageStage: 'Nymph and adult feeding on leaf undersides',
    organicTreatments: [
      {
        method: 'Neem oil or insecticidal soap spray',
        methodTa: 'வேப்ப எண்ணெய் அல்லது பூச்சிக்கொல்லி சோப்பு தெளிப்பு',
        ingredients: ['neem oil', 'mild soap', 'water'],
        preparationSteps: ['Mix 5ml neem oil with a few drops of soap in 1L water', 'Spray thoroughly on leaf undersides, ensuring full coverage'],
        preparationStepsTa: [
          '5மிலி வேப்ப எண்ணெயை சிறிதளவு சோப்புடன் 1லிட்டர் தண்ணீரில் கலக்கவும்',
          'இலைகளின் அடிப்பகுதியில் முழுமையாக நன்கு தெளிக்கவும்',
        ],
        applicationFrequency: 'Every 5-7 days; mites breed fast, so consistency matters more than any single spray',
        precautions: 'Do not combine oil sprays with sulfur within 2-3 weeks (phytotoxic to plants together).',
      },
      {
        method: 'Increase humidity / plain water spray',
        methodTa: 'ஈரப்பதத்தை அதிகரித்தல் / தண்ணீர் தெளிப்பு',
        ingredients: ['water'],
        preparationSteps: [
          'Spray plain water forcefully on leaf undersides, especially during hot dry spells',
          'Ensure adequate irrigation to avoid drought-stressing plants',
        ],
        preparationStepsTa: [
          'வெப்பமான வறண்ட காலங்களில், இலைகளின் அடிப்பகுதியில் தண்ணீரை வேகமாக தெளிக்கவும்',
          'செடிகள் வறட்சியால் பாதிக்கப்படாமல் போதுமான நீர்ப்பாசனம் செய்யவும்',
        ],
        applicationFrequency: 'During hot, dry weather when mite pressure is highest',
        precautions: 'Mites thrive in hot, dry, dusty conditions — this alone often reduces pressure significantly.',
      },
    ],
    preventiveMeasures: [
      'Avoid drought-stressing plants',
      'Avoid excess nitrogen fertilization, which favors mite reproduction',
      'Avoid broad-spectrum sprays that kill natural predator mites and insects',
      'Monitor leaf undersides regularly with a hand lens',
    ],
    severity: 'medium',
    sourceReferences: ['Huang, M.-L.; Chuang, T.C. (2020), "A database of eight common tomato pest images", Mendeley Data, V1, doi:10.17632/s62zm6djd2.1'],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_whitefly',
    pestName: 'Whitefly',
    pestNameTa: 'வெள்ளை ஈ',
    scientificName: 'Bemisia argentifolii (closely related to / considered a biotype of Bemisia tabaci)',
    problemType: 'insect',
    affectedCrops: ['tomato', 'cotton', 'okra', 'vegetables'],
    symptoms:
      'Yellowing leaves, sticky honeydew with sooty mold, and virus transmission (this species/biotype is the main vector of Tomato Yellow Leaf Curl Virus). Adults fly up in a small white cloud when the plant is disturbed.',
    symptomsTa: 'இலைகள் மஞ்சளாதல், ஒட்டும் தேன்பனியுடன் கருமை பூஞ்சை, வைரஸ் பரவல் (இந்த இனம் தக்காளி மஞ்சள் இலை சுருள் வைரஸின் முக்கிய கடத்தி). செடியை தொந்தரவு செய்யும்போது வெள்ளை மேகம் போல பறக்கும்.',
    lifecycle: 'Nymphs are sessile on leaf undersides; adults fly readily when disturbed; short generation time allows rapid buildup in warm weather.',
    damageStage: 'Nymph and adult sap-feeding on leaf undersides',
    organicTreatments: [
      {
        method: 'Yellow sticky traps',
        methodTa: 'மஞ்சள் ஒட்டும் பொறிகள்',
        ingredients: ['yellow sticky trap cards or sheets'],
        preparationSteps: ['Install 10-12 yellow sticky traps per acre just above canopy height', 'Replace or clean traps when saturated'],
        preparationStepsTa: [
          'ஏக்கருக்கு 10-12 மஞ்சள் ஒட்டும் பொறிகளை விதானத்திற்கு மேல் நிறுவவும்',
          'நிறைந்தவுடன் பொறிகளை மாற்றவும் அல்லது சுத்தம் செய்யவும்',
        ],
        applicationFrequency: 'Continuous monitoring through the season',
        precautions: 'Position traps at plant height, adjusting as plants grow.',
      },
      {
        method: 'Neem oil spray',
        methodTa: 'வேப்ப எண்ணெய் தெளிப்பு',
        ingredients: ['neem oil', 'mild soap', 'water'],
        preparationSteps: ['Mix 5ml neem oil with soap solution in 1L water', 'Spray thoroughly on leaf undersides'],
        preparationStepsTa: ['5மிலி வேப்ப எண்ணெயை சோப்பு கரைசலுடன் 1லிட்டர் தண்ணீரில் கலக்கவும்', 'இலைகளின் அடிப்பகுதியில் நன்கு தெளிக்கவும்'],
        applicationFrequency: 'Every 7 days',
        precautions: 'Repeat applications are needed since eggs are not affected.',
      },
    ],
    preventiveMeasures: [
      'Remove and destroy heavily infested leaves',
      'Use reflective/silver mulches to deter adults',
      'Raise seedlings under insect-proof net in the nursery to prevent early infection and virus transmission',
    ],
    severity: 'medium',
    sourceReferences: ['Huang, M.-L.; Chuang, T.C. (2020), "A database of eight common tomato pest images", Mendeley Data, V1, doi:10.17632/s62zm6djd2.1'],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_fruit_fly',
    pestName: 'Melon Fruit Fly',
    pestNameTa: 'முலாம்பழ காய் ஈ',
    scientificName: 'Zeugodacus cucurbitae (syn. Bactrocera cucurbitae)',
    problemType: 'insect',
    affectedCrops: ['tomato', 'cucurbits', 'melon', 'cucumber'],
    symptoms:
      'Small puncture marks (sting marks) on fruit surface from egg-laying; maggots feeding inside the fruit; premature fruit drop and internal rot. Primarily a cucurbit pest that can also attack tomato fruit.',
    symptomsTa: 'முட்டையிடும் இடத்தில் காயில் சிறிய துளை அறிகுறிகள்; காய்க்குள் புழுக்கள் உணவாதல்; காய் முன்கூட்டியே உதிர்தல் மற்றும் உள்ளக அழுகல். முதன்மையாக முலாம்பழ இனங்களை பாதிக்கும் இது தக்காளி காயையும் பாதிக்கலாம்.',
    lifecycle: 'Female punctures fruit to lay eggs; maggots feed inside, then drop to soil to pupate; multiple generations per season.',
    damageStage: 'Larval (maggot) feeding inside fruit',
    organicTreatments: [
      {
        method: 'Cue-lure male attractant traps',
        methodTa: 'க்யூ-லூர் ஆண் ஈர்ப்பு பொறிகள்',
        ingredients: ['cue-lure septa/wicks', 'plastic bottle traps'],
        preparationSteps: ['Set up 4-6 bottle traps per acre baited with cue-lure (attracts and traps male fruit flies specifically)', 'Replace lures every 3-4 weeks'],
        preparationStepsTa: [
          'க்யூ-லூர் மூலம் ஈர்க்கப்படும் 4-6 பாட்டில் பொறிகளை ஏக்கருக்கு அமைக்கவும் (ஆண் ஈக்களை மட்டும் ஈர்க்கும்)',
          'ஒவ்வொரு 3-4 வாரங்களுக்கும் லூர்களை மாற்றவும்',
        ],
        applicationFrequency: 'Continuous through fruiting season',
        precautions: 'Cue-lure attracts only males — combine with bait sprays or sanitation to control the full population.',
      },
      {
        method: 'Field sanitation and fruit bagging',
        methodTa: 'வயல் சுத்தம் மற்றும் காய் பை போடுதல்',
        ingredients: ['paper or cloth fruit bags'],
        preparationSteps: [
          'Collect and destroy (bury deep or solarize in a sealed bag) all fallen and infested fruit daily',
          'Bag young fruit with paper/cloth bags to physically block egg-laying',
        ],
        preparationStepsTa: [
          'விழுந்த மற்றும் பாதிக்கப்பட்ட காய்களை தினமும் சேகரித்து அழிக்கவும் (ஆழமாக புதைக்கவும் அல்லது மூடிய பையில் வெயிலில் வைக்கவும்)',
          'இளம் காய்களை காகித/துணி பைகளால் மூடி முட்டையிடுவதை தடுக்கவும்',
        ],
        applicationFrequency: 'Daily sanitation during fruiting; bagging as fruit sets',
        precautions: 'Uncollected fallen fruit is the main source of the next generation — sanitation matters as much as trapping.',
      },
    ],
    preventiveMeasures: [
      'Daily collection and destruction of fallen fruit',
      'Avoid planting tomato directly beside cucurbit crops where pressure is usually highest',
      'Deep ploughing after harvest to expose pupae in soil',
    ],
    severity: 'medium',
    sourceReferences: ['Huang, M.-L.; Chuang, T.C. (2020), "A database of eight common tomato pest images", Mendeley Data, V1, doi:10.17632/s62zm6djd2.1'],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_thrips',
    pestName: 'Melon Thrips',
    pestNameTa: 'முலாம்பழ த்ரிப்ஸ்',
    scientificName: 'Thrips palmi',
    problemType: 'insect',
    affectedCrops: ['tomato', 'vegetables', 'melon', 'chilli'],
    symptoms:
      'Silvery/bronze streaks and scarring on leaves, distorted growth of young leaves and flowers, tiny black fecal specks. Can transmit tospoviruses (e.g. groundnut bud necrosis virus).',
    symptomsTa: 'இலைகளில் வெள்ளி/வெண்கல நிற கோடுகள் மற்றும் காயங்கள்; இளம் இலைகள் மற்றும் பூக்கள் உருமாறுதல்; சிறிய கருப்பு எச்ச புள்ளிகள். வைரஸ் நோய்களை பரப்பக்கூடும்.',
    lifecycle: 'Nymphs and adults rasp leaf/flower surfaces and feed on the sap released; short generation time, rapid buildup in warm weather.',
    damageStage: 'Nymph and adult feeding on leaves, flowers, and growing points',
    organicTreatments: [
      {
        method: 'Blue sticky traps',
        methodTa: 'நீல ஒட்டும் பொறிகள்',
        ingredients: ['blue sticky trap cards or sheets'],
        preparationSteps: ['Install 10-12 blue sticky traps per acre — thrips are more attracted to blue than yellow', 'Replace or clean traps when saturated'],
        preparationStepsTa: [
          'ஏக்கருக்கு 10-12 நீல ஒட்டும் பொறிகளை நிறுவவும் — த்ரிப்ஸ் மஞ்சளை விட நீலத்தை அதிகம் விரும்பும்',
          'நிறைந்தவுடன் பொறிகளை மாற்றவும் அல்லது சுத்தம் செய்யவும்',
        ],
        applicationFrequency: 'Continuous monitoring through the season',
        precautions: 'Distinguish from whitefly monitoring — thrips need blue traps specifically, not yellow.',
      },
      {
        method: 'Neem oil spray',
        methodTa: 'வேப்ப எண்ணெய் தெளிப்பு',
        ingredients: ['neem oil', 'mild soap', 'water'],
        preparationSteps: ['Mix 5ml neem oil with soap solution in 1L water', 'Spray thoroughly, reaching into flowers and growing points where thrips hide'],
        preparationStepsTa: [
          '5மிலி வேப்ப எண்ணெயை சோப்பு கரைசலுடன் 1லிட்டர் தண்ணீரில் கலக்கவும்',
          'த்ரிப்ஸ் ஒளிந்திருக்கும் பூக்கள் மற்றும் வளர்ச்சி முனைகளை சென்றடையும்படி நன்கு தெளிக்கவும்',
        ],
        applicationFrequency: 'Every 5-7 days during active infestation',
        precautions: 'Thrips hide deep in flowers/growing points — thorough coverage matters more than spray frequency.',
      },
    ],
    preventiveMeasures: [
      'Use reflective mulch to deter adults',
      'Remove and destroy weeds around the field that host thrips between crops',
      'Avoid excess nitrogen, which produces soft growth thrips prefer',
    ],
    severity: 'medium',
    sourceReferences: ['Huang, M.-L.; Chuang, T.C. (2020), "A database of eight common tomato pest images", Mendeley Data, V1, doi:10.17632/s62zm6djd2.1'],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_aphid',
    pestName: 'Green Peach Aphid',
    pestNameTa: 'பச்சை பேன் பூச்சி',
    scientificName: 'Myzus persicae',
    problemType: 'insect',
    affectedCrops: ['tomato', 'vegetables', 'chilli', 'okra'],
    symptoms: 'Curling and yellowing of leaves; sticky honeydew and sooty mold; stunted growth; a major vector of several plant viruses.',
    symptomsTa: 'இலைகள் சுருண்டு மஞ்சளாதல்; ஒட்டும் தேன்பனி மற்றும் கருமை பூஞ்சை; வளர்ச்சி குன்றுதல்; பல தாவர வைரஸ்களின் முக்கிய கடத்தி.',
    lifecycle: 'Nymphs and adults cluster on tender shoots and undersides of leaves, feeding on sap; can reproduce without mating (parthenogenesis) allowing very fast buildup.',
    damageStage: 'Nymph and adult sap-feeding',
    organicTreatments: [
      {
        method: 'Panchagavya spray',
        methodTa: 'பஞ்சகவ்யா தெளிப்பு',
        ingredients: ['panchagavya concentrate', 'water'],
        preparationSteps: ['Dilute panchagavya at 3% (3L in 100L water)', 'Spray on affected foliage, especially undersides of leaves'],
        preparationStepsTa: [
          'பஞ்சகவ்யாவை 3% அளவில் நீர்த்தவும் (100லிட்டர் தண்ணீரில் 3லிட்டர்)',
          'பாதிக்கப்பட்ட இலைகளின் அடிப்பகுதியில் தெளிக்கவும்',
        ],
        applicationFrequency: 'Every 10-15 days',
        precautions: 'Use freshly prepared panchagavya for best results.',
      },
      {
        method: 'Neem oil spray',
        methodTa: 'வேப்ப எண்ணெய் தெளிப்பு',
        ingredients: ['neem oil', 'mild soap', 'water'],
        preparationSteps: ['Mix 5ml neem oil with soap solution in 1L water', 'Spray directly on aphid colonies'],
        preparationStepsTa: ['5மிலி வேப்ப எண்ணெயை சோப்பு கரைசலுடன் 1லிட்டர் தண்ணீரில் கலக்கவும்', 'பேன் பூச்சி கூட்டங்களில் நேரடியாக தெளிக்கவும்'],
        applicationFrequency: 'Every 5-7 days',
        precautions: 'Avoid spraying during flowering to protect pollinators.',
      },
    ],
    preventiveMeasures: [
      'Encourage ladybird beetles and lacewings by avoiding broad-spectrum sprays',
      'Use yellow sticky traps to monitor populations',
      'Avoid excess nitrogen fertilization, which favors aphid reproduction',
    ],
    severity: 'medium',
    sourceReferences: ['Huang, M.-L.; Chuang, T.C. (2020), "A database of eight common tomato pest images", Mendeley Data, V1, doi:10.17632/s62zm6djd2.1'],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_tobacco_cutworm',
    pestName: 'Tobacco Cutworm (Cluster Caterpillar)',
    pestNameTa: 'புகையிலை வெட்டுப்புழு',
    scientificName: 'Spodoptera litura',
    problemType: 'insect',
    affectedCrops: ['tomato', 'vegetables', 'tobacco', 'cotton'],
    symptoms:
      'Ragged holes and skeletonized leaves; young larvae feed gregariously in clusters causing patchy defoliation; older larvae disperse and can cut seedlings at the base.',
    symptomsTa: 'இலைகளில் சீரற்ற துளைகள் மற்றும் இழையம் மட்டும் மிச்சம்; இளம் புழுக்கள் கூட்டமாக ஒன்றாக உணவளித்து திட்டுத்திட்டான இலை இழப்பு; வளர்ந்த புழுக்கள் பரவி இளம் நாற்றுகளை அடியில் வெட்டலாம்.',
    lifecycle: 'Eggs laid in clusters on leaf undersides, covered in hairy scales; young larvae feed together, older larvae disperse and feed alone, often at night.',
    damageStage: 'Larval feeding, especially at night',
    organicTreatments: [
      {
        method: 'Bt (Bacillus thuringiensis) spray',
        methodTa: 'பிடி (பேசில்லஸ் துரிஞ்சியென்சிஸ்) தெளிப்பு',
        ingredients: ['Bacillus thuringiensis (Bt) formulation', 'water'],
        preparationSteps: [
          'Mix Bt formulation as per product label rate in water',
          'Spray in the evening (larvae feed mostly at night, and Bt breaks down in sunlight)',
        ],
        preparationStepsTa: [
          'தயாரிப்பு லேபிளின் அளவின் படி பிடி கரைசலை தண்ணீரில் கலக்கவும்',
          'மாலை நேரத்தில் தெளிக்கவும் (புழுக்கள் இரவில் அதிகம் உணவளிக்கும், பிடி சூரிய ஒளியில் சிதைந்துவிடும்)',
        ],
        applicationFrequency: 'Every 5-7 days during active infestation',
        precautions: 'Bt only works if larvae ingest treated foliage — ensure thorough coverage, especially where egg clusters were seen.',
      },
      {
        method: 'Hand-picking egg masses and larval clusters',
        methodTa: 'முட்டை கூட்டங்கள் மற்றும் புழு திரள்களை கையால் அகற்றுதல்',
        ingredients: [],
        preparationSteps: [
          'Inspect leaf undersides regularly for hairy egg masses and young larval clusters',
          'Remove and destroy the entire leaf section they are on before larvae disperse',
        ],
        preparationStepsTa: [
          'இலைகளின் அடிப்பகுதியை தொடர்ந்து பரிசோதித்து முடி போன்ற முட்டை கூட்டங்களை கண்டறியவும்',
          'புழுக்கள் பரவுவதற்கு முன் அவை இருக்கும் இலை பகுதியை முழுவதுமாக அகற்றி அழிக்கவும்',
        ],
        applicationFrequency: 'Weekly inspection through the season',
        precautions: 'This is most effective while larvae are still clustered — once they disperse, it becomes much harder.',
      },
    ],
    preventiveMeasures: [
      'Deep summer ploughing to expose pupae to sun and predators',
      'Light traps to catch and monitor adult moths',
      'Destroy crop residue and nearby weeds that host early-stage larvae',
    ],
    severity: 'high',
    sourceReferences: ['Huang, M.-L.; Chuang, T.C. (2020), "A database of eight common tomato pest images", Mendeley Data, V1, doi:10.17632/s62zm6djd2.1'],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_beet_armyworm',
    pestName: 'Beet Armyworm',
    pestNameTa: 'பீட் இராணுவப் புழு',
    scientificName: 'Spodoptera exigua',
    problemType: 'insect',
    affectedCrops: ['tomato', 'vegetables', 'cotton', 'onion'],
    symptoms:
      '"Window pane" feeding (scraped leaf surface) by young larvae; ragged holes and defoliation by older larvae; can bore into fruit in later stages.',
    symptomsTa: 'இளம் புழுக்களால் "ஜன்னல் கண்ணாடி" போன்ற உணவளிப்பு (சொறியப்பட்ட இலை பரப்பு); வளர்ந்த புழுக்களால் சீரற்ற துளைகள் மற்றும் இலை இழப்பு; பிற்பாதியில் காயினுள் துளைக்கலாம்.',
    lifecycle:
      'Eggs laid in clusters covered with white/grayish scales; young larvae feed gregariously, older larvae disperse; multiple overlapping generations in warm weather.',
    damageStage: 'Larval feeding on leaves and fruit',
    organicTreatments: [
      {
        method: 'Bt (Bacillus thuringiensis) spray',
        methodTa: 'பிடி (பேசில்லஸ் துரிஞ்சியென்சிஸ்) தெளிப்பு',
        ingredients: ['Bacillus thuringiensis (Bt) formulation', 'water'],
        preparationSteps: [
          'Mix Bt formulation as per product label rate in water',
          'Spray while larvae are young and still feeding gregariously, for best effect',
        ],
        preparationStepsTa: [
          'தயாரிப்பு லேபிளின் அளவின் படி பிடி கரைசலை தண்ணீரில் கலக்கவும்',
          'புழுக்கள் இளமையாகவும் கூட்டமாகவும் உணவளிக்கும் போது தெளிப்பதே சிறந்த பலனைத் தரும்',
        ],
        applicationFrequency: 'Every 5-7 days during active infestation',
        precautions: 'Older, larger larvae are much harder to control — early detection and spraying matters most.',
      },
      {
        method: 'Pheromone traps for adult moths',
        methodTa: 'வயது வந்த அந்துப்பூச்சிகளுக்கான பெரோமோன் பொறிகள்',
        ingredients: ['Spodoptera exigua pheromone lures'],
        preparationSteps: ['Install 8-10 traps per acre at crop canopy height', 'Monitor moth catch weekly to time other interventions'],
        preparationStepsTa: [
          'ஏக்கருக்கு 8-10 பொறிகளை பயிர் விதானத்தின் உயரத்தில் நிறுவவும்',
          'மற்ற நடவடிக்கைகளை திட்டமிட வாராந்திர அந்துப்பூச்சி எண்ணிக்கையை கண்காணிக்கவும்',
        ],
        applicationFrequency: 'Continuous through the season',
        precautions: 'Use trap counts to time Bt sprays for when young larvae are expected to hatch.',
      },
    ],
    preventiveMeasures: [
      'Destroy crop residue and nearby weeds after harvest',
      'Encourage natural enemies (parasitic wasps) by avoiding broad-spectrum sprays',
      'Regularly inspect for and destroy egg masses',
    ],
    severity: 'high',
    sourceReferences: ['Huang, M.-L.; Chuang, T.C. (2020), "A database of eight common tomato pest images", Mendeley Data, V1, doi:10.17632/s62zm6djd2.1'],
    reviewedByExpert: false,
  },
  {
    modelClassLabel: 'tomato_fruit_borer',
    pestName: 'Tomato Fruit Borer',
    pestNameTa: 'தக்காளி காய்ப்புழு',
    scientificName: 'Helicoverpa armigera',
    problemType: 'insect',
    affectedCrops: ['tomato'],
    symptoms: 'Circular bore holes in fruit; larval frass near entry holes; internal fruit damage.',
    symptomsTa: 'காயில் வட்டமான துளைகள்; நுழைவு துளைகளுக்கு அருகில் எச்சம்; உள்ளக காய் சேதம்.',
    lifecycle: 'Larva bores into fruit and feeds internally, moving between fruits.',
    damageStage: 'Larval boring into fruit',
    organicTreatments: [
      {
        method: 'Pheromone traps',
        methodTa: 'பெரோமோன் பொறிகள்',
        ingredients: ['Helicoverpa armigera pheromone lures'],
        preparationSteps: ['Install 10-12 traps per acre above canopy height', 'Replace lures every 3 weeks'],
        preparationStepsTa: ['ஏக்கருக்கு 10-12 பொறிகளை விதானத்திற்கு மேல் நிறுவவும்', 'ஒவ்வொரு 3 வாரங்களுக்கும் லூர்களை மாற்றவும்'],
        applicationFrequency: 'Continuous through the season',
        precautions: 'Combine with regular field scouting for early detection.',
      },
      {
        method: 'Trichogramma biocontrol',
        methodTa: 'ட்ரைக்கோகிராமா உயிரியல் கட்டுப்பாடு',
        ingredients: ['Trichogramma pretiosum or T. chilonis egg cards'],
        preparationSteps: ['Release egg cards weekly starting from flowering stage'],
        preparationStepsTa: ['பூக்கும் பருவத்திலிருந்து வாராந்திரம் முட்டை அட்டைகளை வெளியிடவும்'],
        applicationFrequency: 'Weekly during fruiting season',
        precautions: 'Avoid broad-spectrum sprays that would kill the released parasitoids.',
      },
    ],
    preventiveMeasures: ['Remove and destroy damaged fruits regularly', 'Intercrop with marigold as a trap crop'],
    severity: 'high',
    sourceReferences: ['Huang, M.-L.; Chuang, T.C. (2020), "A database of eight common tomato pest images", Mendeley Data, V1, doi:10.17632/s62zm6djd2.1'],
    reviewedByExpert: false,
  },
];
