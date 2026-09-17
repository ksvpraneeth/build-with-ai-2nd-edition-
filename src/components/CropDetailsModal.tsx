import React, { useState } from 'react';
import { 
  X, 
  Sprout, 
  Calendar, 
  Droplets, 
  Thermometer, 
  Bug, 
  DollarSign, 
  CheckCircle, 
  Sparkles, 
  Layers, 
  MapPin, 
  ExternalLink,
  Info
} from 'lucide-react';
import { CropType, Language } from '../types';
import { CROPS_METADATA } from '../data/telanganaHistoricalData';

interface CropDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCrop: CropType;
  language: Language;
}

export const CropDetailsModal: React.FC<CropDetailsModalProps> = ({
  isOpen,
  onClose,
  initialCrop,
  language,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<CropType>(initialCrop);
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'irrigation' | 'pests' | 'economics'>('overview');

  if (!isOpen) return null;

  const crop = CROPS_METADATA[selectedCrop];

  const getCropDisplayName = (c: CropType) => {
    const meta = CROPS_METADATA[c];
    if (language === 'te') return meta.nameTe;
    if (language === 'hi') return meta.nameHi;
    if (language === 'ur') return meta.nameUr;
    return meta.nameEn;
  };

  const cropList: CropType[] = ['paddy', 'cotton', 'red_gram', 'maize', 'chilli', 'soybean', 'groundnut'];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-100 p-5 sm:p-6 border-b border-stone-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl sm:text-4xl p-2 bg-stone-800/80 rounded-xl border border-stone-700">
              {crop.icon}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Telangana State Certified Agronomy
                </span>
                <span className="text-xs text-stone-400 italic font-mono hidden sm:inline">
                  {crop.botanicalName}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {getCropDisplayName(selectedCrop)}
              </h2>
            </div>
          </div>

          {/* Quick Crop Selector Pill Strip */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none border-t border-stone-800/80 mt-3">
            {cropList.map((cKey) => {
              const isSelected = cKey === selectedCrop;
              return (
                <button
                  key={cKey}
                  onClick={() => setSelectedCrop(cKey)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                  }`}
                >
                  <span>{CROPS_METADATA[cKey].icon}</span>
                  <span>{getCropDisplayName(cKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            📋 Agronomy Overview
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'nutrition'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            🌱 Fertilizer & Soil
          </button>
          <button
            onClick={() => setActiveTab('irrigation')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'irrigation'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            💧 Water & Irrigation ({crop.waterRequirementMm})
          </button>
          <button
            onClick={() => setActiveTab('pests')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'pests'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            🐛 Pests & Management ({crop.majorPestsAndDiseases.length})
          </button>
          <button
            onClick={() => setActiveTab('economics')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'economics'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            💰 Economics & MSP (₹{crop.mspCurrentInr})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-stone-800">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Key Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Duration</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-emerald-950">
                    {crop.durationDays}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center space-x-1.5 text-xs text-blue-700 font-semibold mb-1">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Water Needed</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-blue-950">
                    {crop.waterRequirementMm}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center space-x-1.5 text-xs text-amber-700 font-semibold mb-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Optimum Temp</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-amber-950">
                    {crop.optimalTempRange}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="flex items-center space-x-1.5 text-xs text-purple-700 font-semibold mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Govt MSP (2025)</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-purple-950">
                    ₹{crop.mspCurrentInr.toLocaleString()} / Qtl
                  </div>
                </div>
              </div>

              {/* Agronomic Details Matrix */}
              <div className="bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200 space-y-4">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Telangana Sowing & Soil Specs
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-stone-600 block">Cultivation Seasons:</span>
                    <span className="text-stone-900 font-medium">{crop.seasonSummary}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-600 block">Ideal Soil Types:</span>
                    <span className="text-stone-900 font-medium">{crop.idealSoil}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-600 block">Recommended Seed Rate:</span>
                    <span className="text-stone-900 font-medium">{crop.seedRatePerAcre}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-600 block">Plant Spacing:</span>
                    <span className="text-stone-900 font-medium">{crop.spacing}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-600 block">Typical Expected Yield:</span>
                    <span className="text-emerald-700 font-bold">{crop.expectedYieldRangeQuintalsPerAcre}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-600 block">Top Producing Districts:</span>
                    <span className="text-stone-900 font-medium">{crop.keyDistricts.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* PJTSAU Certified Cultivars */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Recommended High-Yielding Varieties (PJTSAU Certified)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {crop.recommendedVarieties.map((v, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Farmer Tip */}
              <div className="p-4 rounded-xl bg-emerald-900 text-emerald-50 border border-emerald-800 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1">
                    Telangana Agriculture Department Advisory Note
                  </h5>
                  <p className="text-xs sm:text-sm leading-relaxed text-emerald-100">
                    {crop.agronomyTips}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NUTRITION & FERTILIZER */}
          {activeTab === 'nutrition' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Target NPK Dosage
                </div>
                <div className="text-lg font-bold text-stone-900">
                  {crop.npkDosageKgPerAcre}
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Adjust top-dressing dosage based on your soil health card (Matti Pariksha) analysis.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Nutrient Application Stages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-stone-200 bg-white">
                    <span className="font-bold text-stone-900 block mb-1">1. Basal Application</span>
                    <span className="text-stone-600">Full Phosphorus (P), 50% Potash (K), and 25% Nitrogen (N) at last plowing before sowing.</span>
                  </div>
                  <div className="p-3 rounded-lg border border-stone-200 bg-white">
                    <span className="font-bold text-stone-900 block mb-1">2. Vegetative Split</span>
                    <span className="text-stone-600">50% Nitrogen (Urea) at active tillering / branching stage after weed control.</span>
                  </div>
                  <div className="p-3 rounded-lg border border-stone-200 bg-white">
                    <span className="font-bold text-stone-900 block mb-1">3. Reproductive Split</span>
                    <span className="text-stone-600">Remaining 25% Nitrogen and 50% Potash at panicle / flower initiation for robust grain filling.</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-1">Zinc and Micronutrient Advisory for Telangana Soils:</span>
                <p>
                  Most Telangana red chalka and black soils exhibit widespread zinc deficiency. Apply Zinc Sulphate 21% @ 10 kg/acre or Zinc Sulphate 33% @ 6 kg/acre as basal. Do NOT mix Zinc directly with DAP or Single Super Phosphate (SSP).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: WATER & IRRIGATION */}
          {activeTab === 'irrigation' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Total Crop Evapotranspiration Requirement
                  </div>
                  <div className="text-xl font-bold text-blue-950 mt-0.5">
                    {crop.waterRequirementMm}
                  </div>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                  <Droplets className="w-6 h-6" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  Critical Irrigation Milestones (Must NOT Face Moisture Stress)
                </h4>
                <div className="space-y-2.5">
                  {crop.criticalIrrigationStages.map((stage, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-start space-x-3 text-xs sm:text-sm">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </div>
                      <div className="text-stone-900 font-medium leading-relaxed">
                        {stage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700">
                <span className="font-bold block mb-1">Borewell & Canal Synchronization:</span>
                Under Kaleshwaram and Nagarjuna Sagar command areas, synchronize canal rotation turns with critical stages. In borewell irrigated fields, schedule nighttime electricity supply to minimize daytime evaporation loss.
              </div>
            </div>
          )}

          {/* TAB 4: PESTS & DISEASES */}
          {activeTab === 'pests' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-600">
                Integrated Pest Management (IPM) protocols formulated by PJTSAU Krishi Vigyan Kendras across Telangana.
              </div>

              <div className="space-y-3.5">
                {crop.majorPestsAndDiseases.map((pest, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300 transition">
                    <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm mb-2">
                      <Bug className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{pest.name}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-stone-600 block">Visible Field Symptoms:</span>
                        <p className="text-stone-800 leading-relaxed">{pest.symptoms}</p>
                      </div>

                      <div className="pt-2 border-t border-stone-200/80">
                        <span className="font-semibold text-emerald-800 block">Recommended Management & Dosage:</span>
                        <p className="text-stone-900 font-medium leading-relaxed bg-emerald-50/70 p-2 rounded border border-emerald-100 mt-1">
                          {pest.management}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ECONOMICS & MSP */}
          {activeTab === 'economics' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-800 block">Current Govt MSP</span>
                  <span className="text-xl font-bold text-emerald-950">₹{crop.mspCurrentInr.toLocaleString()}</span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">Per Quintal (2025-26)</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-100 border border-stone-200">
                  <span className="text-xs font-semibold text-stone-600 block">Average Cultivation Cost</span>
                  <span className="text-xl font-bold text-stone-900">₹{crop.avgCultivationCostPerAcreInr.toLocaleString()}</span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">Per Acre (Seeds, NPK, Labour)</span>
                </div>

                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="text-xs font-semibold text-teal-800 block">Expected Yield</span>
                  <span className="text-xl font-bold text-teal-950">{crop.expectedYieldRangeQuintalsPerAcre}</span>
                  <span className="text-[11px] text-teal-700 block mt-0.5">Under optimal management</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <h5 className="font-bold text-stone-900 uppercase tracking-wider">
                  Telangana Market Procurement & Rythu Vedikas
                </h5>
                <p className="text-stone-600 leading-relaxed">
                  Grain procurement centers (PPCs) operated by PACS, IKP, and Telangana Civil Supplies Corporation purchase {crop.nameEn} directly at MSP. Farmers must register their Aadhaar linked Pattadar Passbook on the OPMS procurement portal.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950 text-emerald-100 text-xs flex items-center justify-between">
                <span>Key Cultivation Districts: {crop.keyDistricts.join(', ')}</span>
                <span className="font-semibold text-emerald-300">Telangana Certified</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 px-6 flex items-center justify-between text-xs text-stone-500">
          <span>Data validated against PJTSAU Agronomy Handbook & DES Telangana</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
