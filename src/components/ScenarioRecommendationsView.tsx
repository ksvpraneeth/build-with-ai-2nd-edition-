import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Droplets, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Smartphone, 
  Bot, 
  ArrowRight, 
  Coins, 
  CheckCircle2, 
  Leaf, 
  Layers, 
  MapPin,
  Flame,
  Info
} from 'lucide-react';
import { Language, AgroScenarioRecommendation } from '../types';
import { SCENARIO_RECOMMENDATIONS } from '../data/scenarioRecommendations';

interface ScenarioRecommendationsViewProps {
  language: Language;
  onSelectScenarioForAi?: (scenario: AgroScenarioRecommendation) => void;
  onNavigateToSms?: (draftText: string) => void;
  onNavigateToGovt?: () => void;
}

export const ScenarioRecommendationsView: React.FC<ScenarioRecommendationsViewProps> = ({
  language,
  onSelectScenarioForAi,
  onNavigateToSms,
  onNavigateToGovt,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIO_RECOMMENDATIONS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentScenario = SCENARIO_RECOMMENDATIONS.find((s) => s.id === selectedScenarioId) || SCENARIO_RECOMMENDATIONS[0];

  const handleCopySms = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6" id="scenario-recommendations-engine">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>PJTSAU Field Scenarios & Agronomic Roadmaps</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>వ్యవసాయ దృశ్యాలు & సమగ్ర సిఫార్సులు</span>
            <span className="text-emerald-400 text-base sm:text-lg font-normal">/ Scenario Recommendations</span>
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Detailed agronomic prescriptions, MSP guarantees, water-saving calculations, and cellular SMS advisories tailored to 6 distinct agro-climatic challenges across Telangana & Andhra Pradesh.
          </p>
        </div>
      </div>

      {/* Scenario Horizontal Selector Tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        {SCENARIO_RECOMMENDATIONS.map((scen, idx) => {
          const isSelected = scen.id === selectedScenarioId;
          return (
            <button
              key={scen.id}
              onClick={() => setSelectedScenarioId(scen.id)}
              className={`px-4 py-3 rounded-xl border text-left shrink-0 transition-all flex flex-col justify-between max-w-[240px] sm:max-w-[280px] ${
                isSelected
                  ? 'bg-emerald-900/90 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-100 text-stone-600'
                }`}>
                  PIN {scen.pincode}
                </span>
                {scen.heritageStatus?.isHeritageCrop && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-amber-400/20 text-amber-200 border border-amber-300/30' : 'bg-amber-100 text-amber-800'
                  }`}>
                    GI HERITAGE
                  </span>
                )}
              </div>
              <div className="text-xs font-bold line-clamp-2 leading-snug">
                {language === 'te' ? scen.scenarioTitleTe : scen.scenarioTitleEn}
              </div>
              <div className={`text-[10px] mt-1.5 ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                {scen.districtName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Detail Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Scenario Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-50 via-emerald-50/40 to-stone-50 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                PIN: {currentScenario.pincode} • {currentScenario.districtName}
              </span>
              <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-500" />
                <span>{language === 'te' ? currentScenario.climateAndZoneTe : currentScenario.climateAndZoneEn}</span>
              </span>
              {currentScenario.heritageStatus?.isHeritageCrop && (
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>{currentScenario.heritageStatus.giTagRegistration}</span>
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 pt-1">
              {language === 'te' ? currentScenario.scenarioTitleTe : currentScenario.scenarioTitleEn}
            </h3>
          </div>

          {/* Quick Action to AI Assistant */}
          <div className="flex items-center gap-2 shrink-0">
            {onSelectScenarioForAi && (
              <button
                onClick={() => onSelectScenarioForAi(currentScenario)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI About This Scenario</span>
              </button>
            )}
          </div>
        </div>

        {/* Core Problem Callout */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-amber-50/50 flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              {language === 'te' ? 'సవాలు & క్షేత్రస్థాయి సమస్య' : 'The Core Agronomic & Climate Challenge'}
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
              {language === 'te' ? currentScenario.coreProblemTe : currentScenario.coreProblemEn}
            </p>
          </div>
        </div>

        {/* Prescription Grid: 2 Column Layout */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Crop Selection & Economic Viability */}
          <div className="space-y-5">
            {/* Primary Recommended Crop Card */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'te' ? 'సిఫార్సు చేయబడిన ప్రధాన పంట' : 'Primary Recommended Crop'}</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                  PJTSAU Verified
                </span>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-emerald-950">
                  {language === 'te' ? currentScenario.recommendedCropTe : currentScenario.recommendedCropEn}
                </h4>
                <div className="text-xs text-emerald-800 mt-0.5 font-medium">
                  <strong>Specific Varieties:</strong> {currentScenario.varietyRecommendation}
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 text-xs text-stone-700">
                <span className="font-semibold text-stone-900">{language === 'te' ? 'స్థిరమైన ప్రత్యామ్నాయం: ' : 'Sustainable Alternative: '}</span>
                <span>{language === 'te' ? currentScenario.sustainableAlternativeTe : currentScenario.sustainableAlternativeEn}</span>
              </div>
            </div>

            {/* Economic & MSP Viability Box */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'te' ? '2026 కనీస మద్దతు ధర & ఆదాయ విశ్లేషణ' : '2026 Guaranteed MSP & Profit Analysis'}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentScenario.economicBenefit.fciBufferStatus === 'CRITICAL_DEFICIT'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : currentScenario.economicBenefit.fciBufferStatus === 'DEFICIT'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  FCI: {currentScenario.economicBenefit.fciBufferStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-[10px] text-stone-500 font-medium">Base Central MSP</div>
                  <div className="text-sm sm:text-base font-bold text-stone-900">
                    ₹{currentScenario.economicBenefit.baseMspInr.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-stone-400">/ Quintal</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-[10px] text-emerald-700 font-medium">National Deficit Bonus</div>
                  <div className="text-sm sm:text-base font-bold text-emerald-700">
                    +₹{currentScenario.economicBenefit.deficitBonusInr.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-stone-400">/ Quintal</div>
                </div>

                <div className="bg-emerald-900 text-white p-3 rounded-xl shadow-xs">
                  <div className="text-[10px] text-emerald-200 font-bold">Total Payout Rate</div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-300">
                    ₹{currentScenario.economicBenefit.totalGuaranteedRate.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-emerald-200">Guaranteed FCI</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200 text-stone-600">
                <span>Estimated Net Profit: <strong className="text-stone-900">₹{currentScenario.economicBenefit.estimatedNetProfitPerAcreInr.toLocaleString()}/Acre</strong></span>
                <span>Chemical Inputs Saved: <strong className="text-emerald-700">₹{currentScenario.economicBenefit.inputCostSavedPerAcreInr.toLocaleString()}</strong></span>
              </div>

              {onNavigateToGovt && (
                <button
                  onClick={onNavigateToGovt}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Pre-Book Guaranteed FCI Token</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Ecological Impact Card */}
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-700" />
                  <span>{language === 'te' ? 'పర్యావరణం & భూగర్భ జలాల ఆదా' : 'Ecological & Groundwater Impact'}</span>
                </span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Aquifer Risk: {currentScenario.ecologicalImpact.aquiferRiskLevel}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-xl sm:text-2xl font-black text-blue-950">
                  {currentScenario.ecologicalImpact.waterSavedLitersPerAcre.toLocaleString()} Liters
                </div>
                <div className="text-xs text-blue-700 font-medium">water saved per acre</div>
              </div>

              <div className="text-xs text-stone-700 space-y-1">
                <div>
                  <strong>Soil Health:</strong> {language === 'te' ? currentScenario.ecologicalImpact.soilBenefitTe : currentScenario.ecologicalImpact.soilBenefitEn}
                </div>
                <div>
                  <strong>Carbon/Nitrogen:</strong> {language === 'te' ? currentScenario.ecologicalImpact.carbonNitrogenEffectTe : currentScenario.ecologicalImpact.carbonNitrogenEffectEn}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Agronomic Action Steps & 160-Char SMS Dispatch */}
          <div className="space-y-5">
            {/* PJTSAU Step-by-Step Practical Roadmap */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'te' ? 'పీజేటీఎస్ఏయూ క్షేత్రస్థాయి కార్యాచరణ ప్రణాళిక' : 'PJTSAU Agronomic Execution Roadmap'}</span>
                </span>
                <span className="text-[10px] font-semibold text-stone-500">5 Essential Steps</span>
              </div>

              <div className="space-y-2.5">
                {(language === 'te' ? currentScenario.agronomicActionStepsTe : currentScenario.agronomicActionStepsEn).map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-stone-800 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Heritage Protection Notice (if applicable) */}
            {currentScenario.heritageStatus?.isHeritageCrop && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Crop Heritage & Genetic Diversity Guardrail</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {language === 'te' ? currentScenario.heritageStatus.protectionAdvisoryTe : currentScenario.heritageStatus.protectionAdvisoryEn}
                </p>
                {currentScenario.heritageStatus.conservationIncentivePerQtl && (
                  <div className="text-[11px] font-bold text-amber-800">
                    State Conservation Incentive: +₹{currentScenario.heritageStatus.conservationIncentivePerQtl}/Qtl for certified heirloom seeds.
                  </div>
                )}
              </div>
            )}

            {/* Cellular 160-Character SMS Dispatch Box */}
            <div className="bg-[#a4c297] text-stone-950 p-5 rounded-2xl border-2 border-stone-600 shadow-inner space-y-3 font-mono">
              <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>CELLULAR GSM-7 SMS ADVISORY (2G KEYPAD PHONE)</span>
                </span>
                <span>{currentScenario.smsAdvisory160.length}/160 CHARS</span>
              </div>

              <div className="bg-stone-900/10 p-3 rounded-xl border border-stone-600/30 text-xs sm:text-sm font-bold leading-relaxed">
                {currentScenario.smsAdvisory160}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-sans">
                <button
                  onClick={() => handleCopySms(currentScenario.smsAdvisory160, currentScenario.id)}
                  className="inline-flex items-center gap-1.5 text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-stone-800 active:scale-95 transition-all shadow-sm"
                >
                  {copiedId === currentScenario.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy 160-Char SMS</span>
                    </>
                  )}
                </button>

                {onNavigateToSms && (
                  <button
                    onClick={() => onNavigateToSms(currentScenario.smsAdvisory160)}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-950 font-bold hover:underline"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Send in 2G Keypad Gateway</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
