import { CropType, CropDetailInfo } from '../types';

export const CROPS_METADATA: Record<CropType, CropDetailInfo> = {
  paddy: {
    nameEn: 'Paddy / Rice',
    nameTe: 'వరి (ధాన్యం)',
    nameHi: 'धान / चावल',
    nameUr: 'چاول / دھان',
    botanicalName: 'Oryza sativa',
    icon: '🌾',
    durationDays: '125 - 145 Days (Medium - Long)',
    seasonSummary: 'Kharif (Vanakalam) & Rabi (Yasangi)',
    idealSoil: 'Clay loam & Black alluvial soil with high moisture retention capacity',
    idealWater: 'High (1100 - 1350 mm total requirement)',
    waterRequirementMm: '1100 - 1350 mm',
    optimalTempRange: '22°C - 32°C (Germination: 20-30°C, Flowering: 24-29°C)',
    seedRatePerAcre: '20 - 25 kg / acre (Transplanted) or 10 - 12 kg (Direct Seeded Rice - DSR)',
    spacing: '15 x 10 cm or 20 x 15 cm (30-33 hills per square meter)',
    npkDosageKgPerAcre: '48 kg N : 24 kg P2O5 : 16 kg K2O + 10 kg Zinc Sulphate',
    criticalIrrigationStages: [
      'Transplanting / Establishment (Maintain 2-3 cm shallow water level)',
      'Active Tillering Stage (Adopt Alternate Wetting & Drying - AWD to save 25% water)',
      'Panicle Initiation / Booting (Critical: Zero moisture deficit allowed)',
      'Flowering & Milky Grain Stage (Ensure continuous thin film of moisture)',
      'Dough / Maturity (Drain water completely 10-12 days prior to harvest)'
    ],
    majorPestsAndDiseases: [
      {
        name: 'Yellow Stem Borer (Scirpophaga incertulas)',
        symptoms: 'Dead hearts in early vegetative stage, white ear heads (empty chaffy grains) at reproductive heading.',
        management: 'Apply Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Cartap hydrochloride 50% SP @ 2 g/L. Clip seedling leaf tips before transplanting.'
      },
      {
        name: 'Brown Plant Hopper - BPH (Nilaparvata lugens)',
        symptoms: 'Circular patches of drying and yellowing in the field resembling fire burn (Hopper Burn), lodging of crop.',
        management: 'Form alleyways (30 cm paths every 2 meters) for aeration. Spray Triflumezopyrim 10% SC @ 0.48 ml/L or Pymetrozine 50% WDG @ 0.6 g/L. Avoid excess urea.'
      },
      {
        name: 'Rice Blast (Pyricularia oryzae)',
        symptoms: 'Spindle-shaped lesions with gray/ash-colored centers and dark brown borders; neck rot breaking panicles.',
        management: 'Foliar spray with Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40% EC @ 1.5 ml/L during panicle emergence.'
      },
      {
        name: 'Sheath Blight (Rhizoctonia solani)',
        symptoms: 'Snake-skin greenish-gray oval lesions with brown margins on lower leaf sheaths spreading upward.',
        management: 'Apply Hexaconazole 5% EC @ 2 ml/L or Validamycin 3% L @ 2.5 ml/L when symptoms appear on lower leaves.'
      }
    ],
    recommendedVarieties: [
      'Telangana Sona (RNR 15048 - Low Glycemic Index & Blast Resistant)',
      'BPT 5204 (Samba Mahsuri - Fine Grain Benchmark)',
      'KNM 118 (Short Duration, BPH Tolerant)',
      'JGL 24423 (Jagityal Rice)',
      'Kunaram 1638 (High Yielding)',
      'WGL 44 (Warangal Sannalu)'
    ],
    expectedYieldRangeQuintalsPerAcre: '24 - 32 Quintals / Acre',
    mspCurrentInr: 2380,
    avgCultivationCostPerAcreInr: 22500,
    keyDistricts: ['Warangal', 'Karimnagar', 'Nizamabad', 'Nalgonda', 'Siddipet', 'Khammam'],
    agronomyTips: 'Adopting Alternate Wetting and Drying (AWD) with perforated PVC monitoring tubes saves 20-30% irrigation water, preserves tank storage, and reduces methane emissions by 35%.'
  },

  cotton: {
    nameEn: 'Cotton (White Gold)',
    nameTe: 'పత్తి',
    nameHi: 'कपास',
    nameUr: 'کپاس',
    botanicalName: 'Gossypium hirsutum',
    icon: '☁️',
    durationDays: '150 - 180 Days',
    seasonSummary: 'Kharif (Vanakalam)',
    idealSoil: 'Deep Black Cotton Soil (Regur / Nalla Regadi), fertile and well-drained',
    idealWater: 'Moderate (650 - 850 mm total rain/irrigation)',
    waterRequirementMm: '650 - 850 mm',
    optimalTempRange: '24°C - 35°C (Min 18°C, Max 38°C)',
    seedRatePerAcre: '1.5 - 2.0 kg / acre (Bt Hybrids) or 4 - 5 kg (HDPS)',
    spacing: '90 x 60 cm or 90 x 45 cm (High Density Planting System: 60 x 15 cm)',
    npkDosageKgPerAcre: '48 kg N : 24 kg P2O5 : 24 kg K2O applied in 3-4 split doses',
    criticalIrrigationStages: [
      'Square Formation stage (40 - 50 Days After Sowing)',
      'Peak Flowering stage (65 - 75 Days After Sowing)',
      'Boll Development & Enlargement (90 - 110 Days After Sowing)',
      'Boll Bursting & Maturity (Moisture stress leads to premature boll opening)'
    ],
    majorPestsAndDiseases: [
      {
        name: 'Pink Bollworm - PBW (Pectinophora gossypiella)',
        symptoms: 'Rosetted flowers, premature boll opening, locule damage, staining of lint, exit holes on green bolls.',
        management: 'Install 8 pheromone traps/acre for ETL monitoring. Spray Profenofos 50% EC @ 2 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L at 60-90 DAS.'
      },
      {
        name: 'Sucking Pests (Jassids, Thrips, Whiteflies)',
        symptoms: 'Downward & upward cupping of leaves, yellow margins (hopper burn), silvery leaf underside, sticky honeydew.',
        management: 'Stem application of Monocrotophos / Imidacloprid (1:4 with water) at 30 and 45 DAS. Spray Flonicamid 50% WG @ 0.3 g/L for whiteflies.'
      },
      {
        name: 'Bacterial Blight & Leaf Spots (Xanthomonas malvacearum)',
        symptoms: 'Angular water-soaked spots on leaves bounded by veins, black arm symptoms on branches, internal boll rot.',
        management: 'Spray Copper Oxychloride 50% WP @ 3 g/L + Streptocycline @ 0.1 g/L at first sign of lesions.'
      }
    ],
    recommendedVarieties: [
      'Bollgard-II Hybrids (Pioneer, Nuziveedu, Kaveri)',
      'Narsimha (Non-Bt High Ginner)',
      'Mallika Bt (Long Staple)',
      'Bhakthi Bt (Sucking Pest Tolerant)',
      'RCH 659 Bt'
    ],
    expectedYieldRangeQuintalsPerAcre: '8 - 14 Quintals / Acre',
    mspCurrentInr: 7521,
    avgCultivationCostPerAcreInr: 26000,
    keyDistricts: ['Adilabad', 'Warangal', 'Nalgonda', 'Karimnagar', 'Khammam', 'Mahbubnagar'],
    agronomyTips: 'Open conservation furrows after every two rows at 35-40 DAS to capture monsoon runoff and provide drainage during heavy July-August downpours, preventing root suffocation.'
  },

  red_gram: {
    nameEn: 'Red Gram / Pigeon Pea',
    nameTe: 'కంది',
    nameHi: 'अरहर / तूर दाल',
    nameUr: 'دال ارہر',
    botanicalName: 'Cajanus cajan',
    icon: '🌱',
    durationDays: '140 - 180 Days (Medium to Long duration)',
    seasonSummary: 'Kharif (Vanakalam), frequently intercropped with Cotton/Soybean',
    idealSoil: 'Red Chalka (Yerra nelalu) & well-drained light loams (pH 6.5 - 7.5)',
    idealWater: 'Low to Moderate (500 - 650 mm) - Exceptional drought tolerance',
    waterRequirementMm: '500 - 650 mm',
    optimalTempRange: '20°C - 32°C',
    seedRatePerAcre: '3.5 - 4.0 kg / acre (Sole crop) or 1.5 - 2.0 kg (Intercrop)',
    spacing: '120 x 20 cm or 150 x 20 cm',
    npkDosageKgPerAcre: '8 kg N : 20 kg P2O5 : 0 kg K2O + Rhizobium & PSB seed inoculation',
    criticalIrrigationStages: [
      'Branching initiation (30 - 35 Days After Sowing)',
      'Flower bud formation & Anthesis (70 - 80 Days After Sowing)',
      'Pod elongation and grain filling (100 - 115 Days After Sowing)'
    ],
    majorPestsAndDiseases: [
      {
        name: 'Pod Borer (Helicoverpa armigera)',
        symptoms: 'Circular holes on flower buds and green pods with caterpillar body partially inside feeding on developing seeds.',
        management: 'Erect 20 bird perches/acre. Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Flubendiamide 39.35% SC @ 0.2 ml/L during 50% flowering.'
      },
      {
        name: 'Fusarium Wilt (Fusarium udum)',
        symptoms: 'Gradual wilting, drooping and drying of leaves, dark purple vascular band running up the stem under the bark.',
        management: 'Seed treatment with Trichoderma viride @ 10 g/kg seed. Adopt 3-year crop rotation and plant wilt-resistant cultivars (WRG 65, PRG 176).'
      },
      {
        name: 'Sterility Mosaic Disease - SMD',
        symptoms: 'Bushy pale-green stunting without flower buds (known regionally as Green Plague / Banjha Rog).',
        management: 'Control vector eriophyid mites by spraying Fenazaquin 10% EC @ 1.5 ml/L or Propargite 57% EC @ 2 ml/L at initial stages.'
      }
    ],
    recommendedVarieties: [
      'PRG 176 (Telangana Kandi - Resistant to SMD & Wilt)',
      'WRG 65 (Warangal Kandi)',
      'Asha (ICPL 87119 - High Yielding Benchmark)',
      'TDRG 4 (Tandur Red Gram - GI Tagged)',
      'Maruti (ICP 8863)'
    ],
    expectedYieldRangeQuintalsPerAcre: '6 - 10 Quintals / Acre',
    mspCurrentInr: 7550,
    avgCultivationCostPerAcreInr: 13500,
    keyDistricts: ['Mahbubnagar', 'Adilabad', 'Nalgonda', 'Siddipet', 'Rangareddy', 'Warangal'],
    agronomyTips: 'Terminal nipping (clipping top 5 cm shoot tips) at 45 and 65 DAS breaks apical dominance and promotes dense lateral branch flushes, boosting pod counts by 22%.'
  },

  maize: {
    nameEn: 'Maize / Corn',
    nameTe: 'మొక్కజొన్న',
    nameHi: 'मक्का',
    nameUr: 'مکئی',
    botanicalName: 'Zea mays',
    icon: '🌽',
    durationDays: '100 - 115 Days',
    seasonSummary: 'Kharif (Vanakalam) & Rabi (Yasangi - High yield)',
    idealSoil: 'Well-aerated fertile sandy loams and deep red soils with good organic matter',
    idealWater: 'Moderate (550 - 750 mm)',
    waterRequirementMm: '550 - 750 mm',
    optimalTempRange: '21°C - 30°C',
    seedRatePerAcre: '7 - 8 kg / acre (Single cross hybrids)',
    spacing: '60 x 20 cm (1 plant per hill)',
    npkDosageKgPerAcre: '60 kg N : 24 kg P2O5 : 20 kg K2O + 10 kg Zinc Sulphate',
    criticalIrrigationStages: [
      'Knee-high vegetative stage (30 - 35 Days After Sowing)',
      'Tasseling stage (50 - 55 Days After Sowing)',
      'Silking & Cob formation (60 - 65 DAS - Pollen receptivity stage)',
      'Grain filling / Dough stage (75 - 85 Days After Sowing)'
    ],
    majorPestsAndDiseases: [
      {
        name: 'Fall Armyworm - FAW (Spodoptera frugiperda)',
        symptoms: 'Pinholes on leaves, window-pane feeding patches, moist sawdust-like frass inside central whorls.',
        management: 'Apply Spinetoram 11.7% SC @ 0.5 ml/L or Chlorantraniliprole 18.5% SC @ 0.4 ml/L directly into whorls. Install pheromone traps @ 4/acre.'
      },
      {
        name: 'Turcicum Leaf Blight (Exserohilum turcicum)',
        symptoms: 'Long elliptical grayish-green or tan lesions with brown borders on lower leaves spreading upward.',
        management: 'Spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L at first onset.'
      }
    ],
    recommendedVarieties: [
      'DHMC 105 (PJTSAU High Protein Hybrid)',
      'DHM 117 (Drought Tolerant)',
      'Pioneer 30V92',
      'NK 6240',
      'Dekalb 9108'
    ],
    expectedYieldRangeQuintalsPerAcre: '26 - 36 Quintals / Acre',
    mspCurrentInr: 2225,
    avgCultivationCostPerAcreInr: 17500,
    keyDistricts: ['Karimnagar', 'Warangal', 'Nizamabad', 'Siddipet', 'Rangareddy', 'Khammam'],
    agronomyTips: 'Apply Nitrogen in 3 splits: 25% basal, 50% at knee-high stage (30 DAS), and 25% at tasseling. Moisture stress during silking leads to poor pollination and missing grains.'
  },

  chilli: {
    nameEn: 'Chilli (Red Pepper)',
    nameTe: 'మిరప',
    nameHi: 'मिर्च',
    nameUr: 'مرچ',
    botanicalName: 'Capsicum annuum',
    icon: '🌶️',
    durationDays: '150 - 180 Days',
    seasonSummary: 'Kharif to Post-Monsoon (August - March)',
    idealSoil: 'Black & Red fertile loams with excellent internal drainage',
    idealWater: 'Moderate with regular intervals (650 - 900 mm); Drip fertigation highly recommended',
    waterRequirementMm: '650 - 900 mm',
    optimalTempRange: '20°C - 32°C',
    seedRatePerAcre: '200 - 250 grams (Pro-tray healthy seedlings)',
    spacing: '60 x 45 cm or 75 x 45 cm on raised beds',
    npkDosageKgPerAcre: '60 kg N : 30 kg P2O5 : 30 kg K2O in 4 splits + secondary nutrients',
    criticalIrrigationStages: [
      'Establishment & Early Branching (15 - 30 Days After Transplanting)',
      'Flower Bud Initiation (45 - 60 Days After Transplanting)',
      'Fruit Set & Pod Enlargement (75 - 90 Days After Transplanting)',
      'Subsequent flushes between harvest pickings (Moisture stress causes flower drop)'
    ],
    majorPestsAndDiseases: [
      {
        name: 'Invasive Black Thrips (Thrips parvispinus)',
        symptoms: 'Upward curling of leaves, crinkling, flower buds dropping, rasped necrotic patches on pods.',
        management: 'Install 25 blue sticky traps/acre. Spray Spinetoram 11.7% SC @ 1 ml/L or Cyantraniliprole 10.26% OD @ 1.2 ml/L or Flonicamid 50% WG @ 0.4 g/L.'
      },
      {
        name: 'Chilli Leaf Curl Complex (Murda Complex)',
        symptoms: 'Upward and downward curling of foliage, rosette terminal leaves, stunted dwarf bushy growth.',
        management: 'Control whiteflies and yellow mites: spray Diafenthiuron 50% WP @ 1.25 g/L and Spiromesifen 22.9% SC @ 1 ml/L.'
      },
      {
        name: 'Anthracnose & Fruit Rot (Colletotrichum capsici)',
        symptoms: 'Circular sunken lesions with concentric black rings on ripe fruits; die-back of branches.',
        management: 'Foliar spray with Propiconazole 25% EC @ 1 ml/L or Azoxystrobin 23% SC @ 1 ml/L.'
      }
    ],
    recommendedVarieties: [
      'Teja (Warangal Wonder - High Pungency Export Variety)',
      'LCA 334',
      'Guntur Sannam',
      'Syngenta 5531',
      'Armoor Local'
    ],
    expectedYieldRangeQuintalsPerAcre: '16 - 24 Quintals / Acre (Dry Chilli)',
    mspCurrentInr: 19500,
    avgCultivationCostPerAcreInr: 62000,
    keyDistricts: ['Warangal', 'Khammam', 'Suryapet', 'Mahbubnagar', 'Nalgonda'],
    agronomyTips: 'Using silver-black reflective plastic mulch on raised beds prevents soil pupation of black thrips, conserves moisture, and prevents fruit contact with damp soil.'
  },

  soybean: {
    nameEn: 'Soybean',
    nameTe: 'సోయాబీన్',
    nameHi: 'सोयाबीन',
    nameUr: 'سویا بین',
    botanicalName: 'Glycine max',
    icon: '🌿',
    durationDays: '95 - 105 Days (Short duration)',
    seasonSummary: 'Kharif (Vanakalam)',
    idealSoil: 'Deep black soils (Regur) with neutral pH (6.5 - 7.5)',
    idealWater: 'Moderate (600 - 750 mm)',
    waterRequirementMm: '600 - 750 mm',
    optimalTempRange: '20°C - 30°C',
    seedRatePerAcre: '25 - 30 kg / acre',
    spacing: '45 x 10 cm or 30 x 10 cm',
    npkDosageKgPerAcre: '12 kg N : 24 kg P2O5 : 16 kg K2O + Bradyrhizobium & PSB',
    criticalIrrigationStages: [
      'Germination and seedling establishment (0 - 15 Days After Sowing)',
      'Flower initiation (35 - 40 Days After Sowing)',
      'Pod development & Seed Filling (55 - 70 Days After Sowing)'
    ],
    majorPestsAndDiseases: [
      {
        name: 'Girdle Beetle (Obereopsis brevis)',
        symptoms: 'Double cut rings on stems and petioles causing withering of upper leaf clusters.',
        management: 'Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Thiamethoxam 12.6% + Lambda Cyhalothrin 9.5% ZC @ 0.25 ml/L at first ring cuts.'
      },
      {
        name: 'Yellow Mosaic Virus (YMV)',
        symptoms: 'Bright yellow alternating patches on leaf blades, stunted pods, poor seed filling.',
        management: 'Spray Acetamiprid 20% SP @ 0.2 g/L to suppress whitefly vectors. Use YMV-tolerant cultivars (Basara).'
      }
    ],
    recommendedVarieties: [
      'JS 335 (Widely adapted Kharif variety)',
      'JS 9305 (Early Maturing)',
      'Basara (Nizamabad local bred, YMV tolerant)',
      'KDS 344',
      'MACS 1407'
    ],
    expectedYieldRangeQuintalsPerAcre: '7 - 12 Quintals / Acre',
    mspCurrentInr: 4892,
    avgCultivationCostPerAcreInr: 15500,
    keyDistricts: ['Nizamabad', 'Adilabad', 'Karimnagar', 'Warangal'],
    agronomyTips: 'Plant using Broad Bed and Furrow (BBF) systems in northern black soils to prevent water-logging during monsoon cloudbursts while retaining moisture during dry spells.'
  },

  groundnut: {
    nameEn: 'Groundnut / Peanut',
    nameTe: 'వేరుశనగ',
    nameHi: 'मूंगफली',
    nameUr: 'مونگ پھلی',
    botanicalName: 'Arachis hypogaea',
    icon: '🥜',
    durationDays: '105 - 120 Days',
    seasonSummary: 'Kharif (Vanakalam) & Rabi (Yasangi - High yielding)',
    idealSoil: 'Sandy loam & light porous red chalka soil with good aeration',
    idealWater: 'Moderate (500 - 650 mm)',
    waterRequirementMm: '500 - 650 mm',
    optimalTempRange: '22°C - 30°C',
    seedRatePerAcre: '40 - 50 kg kernels / acre',
    spacing: '30 x 10 cm',
    npkDosageKgPerAcre: '8 kg N : 16 kg P2O5 : 20 kg K2O + 200 kg Gypsum at pegging stage',
    criticalIrrigationStages: [
      'Flowering stage (25 - 30 Days After Sowing)',
      'Peg Penetration stage (40 - 45 DAS - Soil surface must remain friable and soft)',
      'Pod development & Kernel swelling (60 - 75 Days After Sowing)',
      'Pod Maturation (Stop irrigation 7-10 days prior to lifting)'
    ],
    majorPestsAndDiseases: [
      {
        name: 'Tikka Leaf Spot (Cercospora arachidicola)',
        symptoms: 'Dark brown and black circular spots with yellow chlorotic halos on foliage causing defoliation.',
        management: 'Spray Tebuconazole 25.9% EC @ 1 ml/L or Carbendazim 12% + Mancozeb 63% WP @ 2 g/L.'
      },
      {
        name: 'Stem Rot / Collar Rot (Sclerotium rolfsii)',
        symptoms: 'Brown rotting lesions at soil level covered with white feather-like fungal mycelium and mustard-like sclerotia.',
        management: 'Seed treatment with Trichoderma viride @ 10 g/kg seed. Soil drench with Hexaconazole 5% EC @ 2 ml/L.'
      }
    ],
    recommendedVarieties: [
      'Kadiri 6 - K6 (Benchmark for Southern Telangana)',
      'TAG 24 (Semi-dwarf high harvest index)',
      'Dharani (Tolerant to leaf spots)',
      'TCGS 150',
      'JL 24'
    ],
    expectedYieldRangeQuintalsPerAcre: '8 - 14 Quintals / Acre (Kharif) / 14 - 18 Quintals (Rabi)',
    mspCurrentInr: 6783,
    avgCultivationCostPerAcreInr: 18000,
    keyDistricts: ['Mahbubnagar', 'Nalgonda', 'Suryapet', 'Warangal', 'Rangareddy'],
    agronomyTips: 'Apply Gypsum @ 200 kg/acre at 40-45 DAS around the root and pegging zone. Calcium is directly absorbed by pods from soil to ensure healthy kernels and eliminate empty shells (pops).'
  }
};
