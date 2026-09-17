export type Language = 'te' | 'en' | 'hi' | 'ur';

export type CropType = 
  | 'paddy' 
  | 'cotton' 
  | 'red_gram' 
  | 'maize' 
  | 'chilli' 
  | 'soybean' 
  | 'groundnut';

export type Season = 'kharif_vanakalam' | 'rabi_yasangi';

export type AgroZone = 'Northern Telangana' | 'Central Telangana' | 'Southern Telangana';

export type SoilType = 'black_cotton' | 'red_chalka' | 'sandy_loam' | 'clay_loam';

export type IrrigationType = 'kaleshwaram_canal' | 'borewell' | 'tank_lake' | 'rainfed' | 'drip_sprinkler';

export interface CropDetailInfo {
  nameEn: string;
  nameTe: string;
  nameHi: string;
  nameUr: string;
  botanicalName: string;
  icon: string;
  durationDays: string;
  seasonSummary: string;
  idealSoil: string;
  idealWater: string;
  waterRequirementMm: string;
  optimalTempRange: string;
  seedRatePerAcre: string;
  spacing: string;
  npkDosageKgPerAcre: string;
  criticalIrrigationStages: string[];
  majorPestsAndDiseases: {
    name: string;
    symptoms: string;
    management: string;
  }[];
  recommendedVarieties: string[];
  expectedYieldRangeQuintalsPerAcre: string;
  mspCurrentInr: number;
  avgCultivationCostPerAcreInr: number;
  keyDistricts: string[];
  agronomyTips: string;
}

export interface DistrictInfo {
  id: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  nameUr: string;
  zone: AgroZone;
  headquarters: string;
  majorCrops: CropType[];
  avgAnnualRainfallMm: number;
  latitude: number;
  longitude: number;
}

export interface HistoricalYearData {
  year: number;
  districtId: string;
  crop: CropType;
  season: Season;
  areaCultivatedAcres: number;
  totalProductionTonnes: number;
  yieldQuintalPerAcre: number;
  monsoonRainfallMm: number;
  annualRainfallMm: number;
  rainfallDeviationPct: number; // e.g., +12% or -8%
  avgTempMaxC: number;
  avgTempMinC: number;
  drySpellDays: number;
  heatwaveDays: number;
  groundwaterDepthMeters: number;
  pestSeverityIndex: 'Low' | 'Moderate' | 'High';
  mspPerQuintalInr: number;
  marketPricePerQuintalInr: number;
}

export interface PredictionScenario {
  rainfallAnomalyPct: number; // e.g. -20, 0, +15
  tempAnomalyC: number; // e.g. 0, +1.5, +2.5
  fertilizerManagement: 'optimum' | 'reduced' | 'excess';
  pestManagement: 'integrated' | 'conventional' | 'delayed';
}

export interface YieldPredictionResult {
  predictedYieldQuintalsPerAcre: number;
  historicalAvgYield: number;
  changePercentage: number;
  confidenceScore: number;
  climateOutlook: {
    monsoonOnset: string;
    rainfallForecastMm: number;
    droughtRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
    drySpellRisk: string;
    temperatureTrend: string;
  };
  recommendedPractices: {
    sowingWindow: string;
    seedVarieties: string[];
    fertilizerSchedule: { stage: string; fertilizer: string; dosage: string }[];
    irrigationSchedule: string;
    pestWarnings: { pest: string; risk: string; organicRemedy: string; chemicalRemedy: string }[];
    harvestWindow: string;
  };
  economicForecast: {
    estimatedRevenuePerAcre: number;
    projectedInputCostPerAcre: number;
    expectedNetProfitPerAcre: number;
  };
  reasoningNotes: string;
}

export interface WeatherAlert {
  id: string;
  districtId: string;
  districtName: string;
  severity: 'advisory' | 'warning' | 'critical';
  type: 'unseasonal_rain' | 'heatwave' | 'dry_spell' | 'pest_outbreak' | 'thunderstorm';
  titleEn: string;
  titleTe: string;
  titleHi: string;
  titleUr: string;
  descriptionEn: string;
  descriptionTe: string;
  descriptionHi: string;
  descriptionUr: string;
  actionItemsEn: string[];
  actionItemsTe: string[];
  validUntil: string;
  issuedAt: string;
}

export interface FarmerCloudRecord {
  id: string;
  timestamp: number;
  farmerName: string;
  village: string;
  districtId: string;
  crop: CropType;
  farmSizeAcres: number;
  soilType: SoilType;
  irrigationType: IrrigationType;
  recordedRainfallMm?: number;
  actualYieldQuintalPerAcre?: number;
  notes?: string;
  status: 'synced' | 'pending';
  syncTimestamp?: number;
}

export interface SyncStatusState {
  isOnline: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  isSyncing: boolean;
}

// ================= KISAN-SETU NATIONAL BUFFER & SMS TYPES =================

export type BufferDeficitStatus = 'CRITICAL_DEFICIT' | 'DEFICIT' | 'BALANCED' | 'SURPLUS';

export interface NationalFoodBuffer {
  cropId: string;
  cropNameEn: string;
  cropNameTe: string;
  category: 'grain' | 'pulse' | 'oilseed' | 'cash_crop' | 'millet' | 'spice';
  targetBufferMillionTonnes: number;
  currentStockMillionTonnes: number;
  deficitSurplusPct: number; // e.g. -56.2 or +108.0
  status: BufferDeficitStatus;
  priorityScore: number; // 1 to 100 (higher = urgent national priority)
  mspCurrentInrPerQtl: number;
  procurementBonusInrPerQtl: number;
  recommendedAction: string;
  fciProcurementWindow: string;
}

export interface RegionalAgroProfile {
  pincode: string;
  districtId: string;
  districtName: string;
  state: string;
  soilClassification: string;
  soilPh: number;
  fiveYearAvgRainfallMm: number;
  fiveYearAvgTempC: number;
  droughtVulnerability: 'Low' | 'Moderate' | 'High' | 'Severe';
  giTagHeritageCrops: string[];
  heritageEcologyNotes?: string;
  dominantLanguage: Language;
}

export interface SuitabilityEvaluationResult {
  viabilityScore: number; // 0-100
  sustainabilityScore: number; // 0-100
  nationalBufferMatch: boolean;
  nationalBufferStatus: BufferDeficitStatus;
  heritageGuardrailTriggered: boolean;
  heritageConflictWarning: string | null;
  mspGuaranteeEligible: boolean;
  recommendedAlternative: string | null;
  smsAdvisory160: string; // Strictly <= 160 characters
  smsAdvisoryEn: string;
  detectedLanguage: Language;
  recommendedMspInr: number;
  procurementIncentiveInr: number;
  scientificRationale: string;
  weatherSoilSummary: {
    rainfallMm: number;
    rainfallStatus: string;
    soilPh: number;
    soilType: string;
    temperatureRange: string;
  };
}

export type ProcurementStatus = 'pending' | 'approved' | 'rejected' | 'flagged_heritage';

export interface ProcurementRequest {
  id: string;
  timestamp: number;
  farmerPhone: string;
  farmerName: string;
  pincode: string;
  districtName: string;
  requestedCrop: string;
  farmAreaAcres: number;
  soilPh: number;
  rainfallMm: number;
  viabilityScore: number;
  sustainabilityScore: number;
  nationalBufferStatus: BufferDeficitStatus;
  heritageConflict: boolean;
  heritageDetails?: string;
  status: ProcurementStatus;
  mspPricePerQtlInr: number;
  procurementIncentiveInr: number;
  preBookingToken?: string;
  officerNotes?: string;
  smsAdvisoryDispatched: string;
  source: 'sms_keypad' | 'web_portal' | 'twilio_webhook';
  language: Language;
  approvedAt?: number;
  officerName?: string;
}

export interface SmsLogEntry {
  id: string;
  timestamp: number;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  body: string;
  characterCount: number;
  language: Language;
  pincode?: string;
  parsedCrop?: string;
  status: 'delivered' | 'processed' | 'failed';
  messageSid?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  suggestedSms160?: string;
  category?: 'advisory' | 'procurement' | 'weather' | 'general';
}

export interface AgroScenarioRecommendation {
  id: string;
  pincode: string;
  districtId: string;
  districtName: string;
  scenarioTitleEn: string;
  scenarioTitleTe: string;
  climateAndZoneEn: string;
  climateAndZoneTe: string;
  coreProblemEn: string;
  coreProblemTe: string;
  recommendedCropEn: string;
  recommendedCropTe: string;
  varietyRecommendation: string;
  sustainableAlternativeEn: string;
  sustainableAlternativeTe: string;
  economicBenefit: {
    baseMspInr: number;
    deficitBonusInr: number;
    totalGuaranteedRate: number;
    fciBufferStatus: 'CRITICAL_DEFICIT' | 'DEFICIT' | 'BALANCED' | 'SURPLUS';
    estimatedNetProfitPerAcreInr: number;
    inputCostSavedPerAcreInr: number;
  };
  ecologicalImpact: {
    waterSavedLitersPerAcre: number;
    soilBenefitEn: string;
    soilBenefitTe: string;
    carbonNitrogenEffectEn: string;
    carbonNitrogenEffectTe: string;
    aquiferRiskLevel: 'Low' | 'Moderate' | 'Severe';
  };
  agronomicActionStepsEn: string[];
  agronomicActionStepsTe: string[];
  smsAdvisory160: string;
  heritageStatus?: {
    isHeritageCrop: boolean;
    giTagRegistration?: string;
    conservationIncentivePerQtl?: number;
    protectionAdvisoryEn?: string;
    protectionAdvisoryTe?: string;
  };
}

export interface HeritageCropProfile {
  id: string;
  cropNameEn: string;
  cropNameTe: string;
  giTagNumber: string;
  designatedRegion: string;
  designatedPincode: string;
  soilEcologyRequirementEn: string;
  soilEcologyRequirementTe: string;
  uniqueHeritageTraitEn: string;
  uniqueHeritageTraitTe: string;
  ecologicalRiskFactorsEn: string[];
  ecologicalRiskFactorsTe: string[];
  conservationProtocolsEn: string[];
  conservationProtocolsTe: string[];
  procurementBonusInrPerQtl: number;
  pjtsauCertificationCode: string;
  badgeLabel: string;
}

