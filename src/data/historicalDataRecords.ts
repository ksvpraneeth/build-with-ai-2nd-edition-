import { HistoricalYearData, CropType, Season } from '../types';

interface DistrictBaseline {
  id: string;
  normalRainfallMm: number;
  soilFactor: number;
  groundwaterBaseMeters: number;
}

const DISTRICT_SPECS: DistrictBaseline[] = [
  { id: 'warangal', normalRainfallMm: 994, soilFactor: 1.02, groundwaterBaseMeters: 5.6 },
  { id: 'karimnagar', normalRainfallMm: 953, soilFactor: 1.04, groundwaterBaseMeters: 5.2 },
  { id: 'nizamabad', normalRainfallMm: 1035, soilFactor: 1.05, groundwaterBaseMeters: 4.8 },
  { id: 'nalgonda', normalRainfallMm: 752, soilFactor: 0.94, groundwaterBaseMeters: 7.2 },
  { id: 'khammam', normalRainfallMm: 1124, soilFactor: 1.06, groundwaterBaseMeters: 4.5 },
  { id: 'adilabad', normalRainfallMm: 1157, soilFactor: 1.03, groundwaterBaseMeters: 4.9 },
  { id: 'mahbubnagar', normalRainfallMm: 680, soilFactor: 0.91, groundwaterBaseMeters: 8.5 },
  { id: 'siddipet', normalRainfallMm: 865, soilFactor: 0.98, groundwaterBaseMeters: 6.1 },
  { id: 'suryapet', normalRainfallMm: 820, soilFactor: 0.96, groundwaterBaseMeters: 6.4 },
  { id: 'rangareddy', normalRainfallMm: 780, soilFactor: 0.93, groundwaterBaseMeters: 7.6 },
];

interface CropYieldProfile {
  baseYield: number; // Quintals per acre in normal conditions
  baseAcres: number;
  season: Season;
  msps: Record<number, number>;
  marketPremiums: Record<number, number>;
  soilAffinity: Record<string, number>;
  rainAffinity: number; // Sensitivity to drought vs flood
}

const CROP_PROFILES: Record<CropType, CropYieldProfile> = {
  paddy: {
    baseYield: 26.5,
    baseAcres: 210000,
    season: 'kharif_vanakalam',
    msps: { 2020: 1868, 2021: 1940, 2022: 2040, 2023: 2183, 2024: 2300, 2025: 2380 },
    marketPremiums: { 2020: 50, 2021: 80, 2022: 70, 2023: 110, 2024: 150, 2025: 140 },
    soilAffinity: { warangal: 1.02, karimnagar: 1.05, nizamabad: 1.06, nalgonda: 0.98, khammam: 1.03, adilabad: 0.95, mahbubnagar: 0.88, siddipet: 1.01, suryapet: 1.0, rangareddy: 0.92 },
    rainAffinity: 0.8, // Loves water
  },
  cotton: {
    baseYield: 10.0,
    baseAcres: 165000,
    season: 'kharif_vanakalam',
    msps: { 2020: 5515, 2021: 5726, 2022: 6080, 2023: 6620, 2024: 7122, 2025: 7521 },
    marketPremiums: { 2020: 250, 2021: 450, 2022: 380, 2023: 520, 2024: 400, 2025: 480 },
    soilAffinity: { warangal: 1.04, karimnagar: 0.98, nizamabad: 0.95, nalgonda: 1.02, khammam: 1.01, adilabad: 1.08, mahbubnagar: 0.96, siddipet: 0.99, suryapet: 1.01, rangareddy: 0.94 },
    rainAffinity: -0.4, // Suffers in excess rain floods
  },
  red_gram: {
    baseYield: 6.8,
    baseAcres: 85000,
    season: 'kharif_vanakalam',
    msps: { 2020: 6000, 2021: 6300, 2022: 6600, 2023: 7000, 2024: 7550, 2025: 7900 },
    marketPremiums: { 2020: 300, 2021: 400, 2022: 450, 2023: 650, 2024: 700, 2025: 750 },
    soilAffinity: { warangal: 0.98, karimnagar: 0.95, nizamabad: 0.96, nalgonda: 1.05, khammam: 0.94, adilabad: 1.02, mahbubnagar: 1.08, siddipet: 1.02, suryapet: 0.97, rangareddy: 1.04 },
    rainAffinity: -0.6, // High drought hardiness, hates root flooding
  },
  maize: {
    baseYield: 29.0,
    baseAcres: 120000,
    season: 'kharif_vanakalam',
    msps: { 2020: 1850, 2021: 1870, 2022: 1962, 2023: 2090, 2024: 2225, 2025: 2325 },
    marketPremiums: { 2020: 80, 2021: 90, 2022: 120, 2023: 160, 2024: 180, 2025: 195 },
    soilAffinity: { warangal: 1.02, karimnagar: 1.06, nizamabad: 1.04, nalgonda: 0.93, khammam: 1.01, adilabad: 0.96, mahbubnagar: 0.91, siddipet: 1.03, suryapet: 0.98, rangareddy: 1.05 },
    rainAffinity: 0.2,
  },
  chilli: {
    baseYield: 18.5,
    baseAcres: 72000,
    season: 'kharif_vanakalam',
    msps: { 2020: 14200, 2021: 15800, 2022: 18500, 2023: 21000, 2024: 19500, 2025: 20500 },
    marketPremiums: { 2020: 800, 2021: 1200, 2022: 1500, 2023: 2200, 2024: 1800, 2025: 2100 },
    soilAffinity: { warangal: 1.08, karimnagar: 0.97, nizamabad: 0.94, nalgonda: 0.99, khammam: 1.07, adilabad: 0.92, mahbubnagar: 0.95, siddipet: 0.98, suryapet: 1.04, rangareddy: 0.96 },
    rainAffinity: -0.5, // Vulnerable to humidity fungal & thrips complexes
  },
  soybean: {
    baseYield: 8.8,
    baseAcres: 95000,
    season: 'kharif_vanakalam',
    msps: { 2020: 3880, 2021: 3950, 2022: 4300, 2023: 4600, 2024: 4892, 2025: 5120 },
    marketPremiums: { 2020: 120, 2021: 180, 2022: 210, 2023: 260, 2024: 290, 2025: 320 },
    soilAffinity: { warangal: 0.98, karimnagar: 1.01, nizamabad: 1.09, nalgonda: 0.88, khammam: 0.92, adilabad: 1.07, mahbubnagar: 0.85, siddipet: 0.96, suryapet: 0.87, rangareddy: 0.95 },
    rainAffinity: 0.1,
  },
  groundnut: {
    baseYield: 9.8,
    baseAcres: 64000,
    season: 'kharif_vanakalam',
    msps: { 2020: 5275, 2021: 5550, 2022: 5850, 2023: 6377, 2024: 6783, 2025: 7140 },
    marketPremiums: { 2020: 220, 2021: 300, 2022: 340, 2023: 420, 2024: 460, 2025: 500 },
    soilAffinity: { warangal: 0.99, karimnagar: 0.94, nizamabad: 0.91, nalgonda: 1.04, khammam: 0.95, adilabad: 0.91, mahbubnagar: 1.10, siddipet: 1.01, suryapet: 1.05, rangareddy: 1.03 },
    rainAffinity: -0.3,
  },
};

interface YearMacroClimate {
  year: number;
  monsoonRainDevPct: number;
  annualRainDevPct: number;
  avgTempMaxC: number;
  avgTempMinC: number;
  drySpellDays: number;
  heatwaveDays: number;
  groundwaterModifier: number;
  generalPest: 'Low' | 'Moderate' | 'High';
  yieldImpactMultiplier: number;
}

const YEAR_CLIMATE_INDEX: YearMacroClimate[] = [
  {
    year: 2020,
    monsoonRainDevPct: 38.5,
    annualRainDevPct: 35.2,
    avgTempMaxC: 32.8,
    avgTempMinC: 22.4,
    drySpellDays: 6,
    heatwaveDays: 4,
    groundwaterModifier: 0.9,
    generalPest: 'Moderate',
    yieldImpactMultiplier: 1.01,
  },
  {
    year: 2021,
    monsoonRainDevPct: 19.2,
    annualRainDevPct: 17.8,
    avgTempMaxC: 32.4,
    avgTempMinC: 22.0,
    drySpellDays: 4,
    heatwaveDays: 2,
    groundwaterModifier: 0.8,
    generalPest: 'Low',
    yieldImpactMultiplier: 1.08,
  },
  {
    year: 2022,
    monsoonRainDevPct: 45.4,
    annualRainDevPct: 41.6,
    avgTempMaxC: 32.2,
    avgTempMinC: 21.9,
    drySpellDays: 5,
    heatwaveDays: 3,
    groundwaterModifier: 0.75,
    generalPest: 'High',
    yieldImpactMultiplier: 0.97,
  },
  {
    year: 2023,
    monsoonRainDevPct: -22.6,
    annualRainDevPct: -20.4,
    avgTempMaxC: 34.8,
    avgTempMinC: 23.4,
    drySpellDays: 19,
    heatwaveDays: 10,
    groundwaterModifier: 1.35,
    generalPest: 'Moderate',
    yieldImpactMultiplier: 0.85,
  },
  {
    year: 2024,
    monsoonRainDevPct: 24.1,
    annualRainDevPct: 22.0,
    avgTempMaxC: 32.7,
    avgTempMinC: 22.1,
    drySpellDays: 7,
    heatwaveDays: 5,
    groundwaterModifier: 0.82,
    generalPest: 'Low',
    yieldImpactMultiplier: 1.07,
  },
  {
    year: 2025,
    monsoonRainDevPct: 19.5,
    annualRainDevPct: 18.0,
    avgTempMaxC: 32.9,
    avgTempMinC: 22.2,
    drySpellDays: 6,
    heatwaveDays: 4,
    groundwaterModifier: 0.78,
    generalPest: 'Low',
    yieldImpactMultiplier: 1.11,
  },
];

function generateTelanganaHistoricalRecords(): HistoricalYearData[] {
  const records: HistoricalYearData[] = [];

  for (const dist of DISTRICT_SPECS) {
    for (const [cropKey, profile] of Object.entries(CROP_PROFILES) as [CropType, CropYieldProfile][]) {
      for (const climate of YEAR_CLIMATE_INDEX) {
        const year = climate.year;
        const soilMatch = profile.soilAffinity[dist.id] || 1.0;
        
        // Rainfall calculations for this district and year
        const annualRainfallMm = Math.round(dist.normalRainfallMm * (1 + climate.annualRainDevPct / 100));
        const monsoonRainfallMm = Math.round(annualRainfallMm * 0.82);

        // Yield calculation based on climate, rain affinity, and district agro-suitability
        let yieldFactor = climate.yieldImpactMultiplier * soilMatch;
        if (climate.year === 2023) {
          // El Niño year impact
          if (profile.rainAffinity > 0.5) {
            yieldFactor *= 0.88; // Paddy had canal buffering
          } else if (profile.rainAffinity < -0.3) {
            yieldFactor *= 0.92; // Red gram / Groundnut stood drought well
          } else {
            yieldFactor *= 0.82; // Rainfed cotton suffered
          }
        } else if (climate.year === 2022) {
          // Flood year: root rot in pulses & cotton, great for paddy
          if (cropKey === 'paddy') yieldFactor *= 1.04;
          if (cropKey === 'chilli' || cropKey === 'cotton') yieldFactor *= 0.91;
        }

        const calculatedYield = +(profile.baseYield * yieldFactor).toFixed(1);

        // Cultivated area variance across years (+/- 10%)
        const yearAreaMultiplier = 1.0 + ((year - 2020) * 0.02) + (climate.annualRainDevPct > 0 ? 0.03 : -0.04);
        const areaCultivatedAcres = Math.round(profile.baseAcres * (soilMatch > 1 ? 1.1 : 0.8) * yearAreaMultiplier);
        
        // 1 Quintal = 0.1 Tonnes
        const totalProductionTonnes = Math.round(areaCultivatedAcres * (calculatedYield * 0.1));

        const groundwaterDepthMeters = +(dist.groundwaterBaseMeters * climate.groundwaterModifier).toFixed(1);

        const msp = profile.msps[year] || 2200;
        const marketPrice = msp + (profile.marketPremiums[year] || 100);

        records.push({
          year,
          districtId: dist.id,
          crop: cropKey,
          season: profile.season,
          areaCultivatedAcres,
          totalProductionTonnes,
          yieldQuintalPerAcre: calculatedYield,
          monsoonRainfallMm,
          annualRainfallMm,
          rainfallDeviationPct: climate.annualRainDevPct,
          avgTempMaxC: climate.avgTempMaxC,
          avgTempMinC: climate.avgTempMinC,
          drySpellDays: climate.drySpellDays,
          heatwaveDays: climate.heatwaveDays,
          groundwaterDepthMeters,
          pestSeverityIndex: climate.generalPest,
          mspPerQuintalInr: msp,
          marketPricePerQuintalInr: marketPrice,
        });
      }
    }
  }

  return records;
}

export const HISTORICAL_AGRICULTURAL_DATA: HistoricalYearData[] = generateTelanganaHistoricalRecords();
