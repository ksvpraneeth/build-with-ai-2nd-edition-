import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Leaf, 
  Compass, 
  Coins, 
  Copy, 
  Check, 
  Smartphone, 
  Bot, 
  ArrowRight,
  Droplets,
  Scale,
  RefreshCw,
  Layers,
  FileCheck
} from 'lucide-react';
import { Language, HeritageCropProfile } from '../types';
import { HERITAGE_CROP_REGISTRY } from '../data/scenarioRecommendations';
import { REGIONAL_AGRO_REGISTRY } from '../data/procurementData';

interface CropHeritageProtectionViewProps {
  language: Language;
  onNavigateToAi?: (prompt: string) => void;
  onNavigateToSms?: (draftText: string) => void;
  onNavigateToGovt?: () => void;
}

export const CropHeritageProtectionView: React.FC<CropHeritageProtectionViewProps> = ({
  language,
  onNavigateToAi,
  onNavigateToSms,
  onNavigateToGovt,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>(HERITAGE_CROP_REGISTRY[0].id);
  const [auditPincode, setAuditPincode] = useState<string>('501141');
  const [auditCrop, setAuditCrop] = useState<string>('red_gram');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeHeritageCrop = HERITAGE_CROP_REGISTRY.find((c) => c.id === selectedCropId) || HERITAGE_CROP_REGISTRY[0];
  const auditProfile = REGIONAL_AGRO_REGISTRY[auditPincode] || REGIONAL_AGRO_REGISTRY['501141'];

  // Calculate live guardrail audit status
  const isDirectGiMatch = 
    (auditPincode === '501141' && auditCrop === 'red_gram') ||
    (auditPincode === '506001' && (auditCrop === 'chilli' || auditCrop === 'cotton')) ||
    (auditPincode === '522001' && auditCrop === 'chilli') ||
    (auditPincode === '503001' && auditCrop === 'turmeric') ||
    (auditPincode === '505001' && auditCrop === 'soybean');

  const isEcologicalHazard = 
    (auditPincode === '509001' && auditCrop === 'paddy') ||
    (auditPincode === '508001' && auditCrop === 'paddy');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6" id="crop-heritage-protection-center">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-2xl p-6 sm:p-8 border border-amber-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Geographical Indication (GI) & Agro-Heritage Defense Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>రైతు వారసత్వ పంటల రక్షణ వ్యవస్థ</span>
            <span className="text-amber-400 text-lg sm:text-xl font-normal">/ Crop Heritage & GI Protection</span>
          </h2>
          <p className="text-amber-100/80 text-xs sm:text-sm leading-relaxed">
            Protecting Telangana and Andhra Pradesh's indigenous heirloom seeds, official Geographical Indication (GI) crops, and soil biodiversity against commercial monoculture degradation, genetic dilution, and uncertified hybrids.
          </p>
        </div>
      </div>

      {/* Interactive Heritage Guardrail Auditor */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>{language === 'te' ? 'ప్రత్యక్ష క్షేత్ర వారసత్వ ఆడిట్ స్కానర్' : 'Live Field Heritage & Biodiversity Guardrail Audit'}</span>
            </h3>
            <p className="text-xs text-stone-500">
              Select your region and crop to verify GI legitimacy, ecological guardrails, and conservation subsidies.
            </p>
          </div>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full w-fit">
            Biological Diversity Act 2002 Compliant
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Target Region Pincode</label>
            <select
              value={auditPincode}
              onChange={(e) => setAuditPincode(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-stone-900"
            >
              <option value="501141">501141 - Vikarabad (Tandur Red Gram GI Basin)</option>
              <option value="506001">506001 - Warangal (Chapata Chilli GI & Cotton)</option>
              <option value="522001">522001 - Guntur (Sannam Chilli GI Corridor)</option>
              <option value="503001">503001 - Nizamabad (Armoor Turmeric Heritage)</option>
              <option value="505001">505001 - Karimnagar (Telangana Sona Rice Heritage)</option>
              <option value="509001">509001 - Mahbubnagar (Semi-Arid Millet Heritage)</option>
              <option value="504001">504001 - Adilabad (Tribal Organic Desi Cotton)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Proposed Crop to Cultivate</label>
            <select
              value={auditCrop}
              onChange={(e) => setAuditCrop(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-stone-900"
            >
              <option value="red_gram">Red Gram / Kandulu (Tur Dal)</option>
              <option value="chilli">Chilli / Mirchi (Chapata / Sannam / Teja)</option>
              <option value="millets">Nutri-Millets / Jowar / Foxtail</option>
              <option value="cotton">Cotton / Patti (Long Staple)</option>
              <option value="soybean">Yellow Soybean (Oilseed)</option>
              <option value="turmeric">Turmeric / Pasupu (Curcumin Rhizome)</option>
              <option value="paddy">Common Paddy (Flood Irrigation)</option>
            </select>
          </div>
        </div>

        {/* Live Guardrail Result Card */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDirectGiMatch
            ? 'bg-emerald-50/70 border-emerald-300'
            : isEcologicalHazard
            ? 'bg-rose-50/70 border-rose-300'
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {isDirectGiMatch ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>PROTECTED HERITAGE CROP • GI VERIFIED</span>
                  </span>
                ) : isEcologicalHazard ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-2xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>CRITICAL BIODIVERSITY ALERT • MONOCULTURE HAZARD</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-700 text-white text-xs font-bold shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>STANDARD AGRO COMPLIANCE • SAFE ROTATION</span>
                  </span>
                )}
                <span className="text-xs font-semibold text-stone-600">
                  {auditProfile.districtName} ({auditProfile.soilClassification})
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                {isDirectGiMatch ? (
                  language === 'te' 
                    ? `ఈ ప్రాంతం (${auditProfile.districtName}) యొక్క నేల స్వభావం మరియు వాతావరణం ఈ వారసత్వ పంటకు సంపూర్ణ అనుకూలమైనవి. ఇది స్థానిక GI ట్యాగ్ కింద పరిరక్షించబడింది మరియు క్వింటాలుకు ₹500 - ₹650 అదనపు సంరక్షణ బోనస్ కు అర్హత కలిగి ఉంది.`
                    : `This region (${auditProfile.districtName}) is the legally designated Geographical Indication basin. Cultivating authenticated heirloom varieties preserves indigenous genetics and entitles the farmer to a ₹500 - ₹650/Qtl conservation premium.`
                ) : isEcologicalHazard ? (
                  language === 'te'
                    ? `హెచ్చరిక: తీవ్ర నీటి ఎద్దడి ఉన్న ఈ ప్రాంతంలో (${auditProfile.districtName}) అధిక నీరు తాగే సాధారణ వరి సాగు చేయడం వల్ల భూగర్భ జలాలు పూర్తిగా అడుగంటుతాయి. వెంటనే చిరుధాన్యాలు లేదా వేరుశనగ సాగుకు మారండి.`
                    : `CRITICAL ALERT: Planting flood-irrigated summer paddy in water-stressed ${auditProfile.districtName} causes aquifer collapse and fails national crop diversification standards. Transition immediately to drought-hardy Millets or Pulses.`
                ) : (
                  language === 'te'
                    ? `ఈ పంట ఎంపిక సమతుల్య పంట మార్పిడి నిబంధనలకు అనుకూలంగా ఉంది. స్థానిక జీవవైవిధ్యానికి ఎటువంటి హాని లేదు.`
                    : `This crop selection adheres to sustainable rotation guidelines. Soil microbial activity is maintained within safe parameters.`
                )}
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 flex items-center gap-2">
              {onNavigateToAi && (
                <button
                  onClick={() => onNavigateToAi(`What are the heritage protection and conservation protocols for ${auditCrop} in ${auditProfile.districtName} (${auditPincode})?`)}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Consult Heritage AI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Protected Heritage GI Crops Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            {language === 'te' ? 'తెలంగాణ & ఆంధ్రప్రదేశ్ గుర్తింపు పొందిన GI పంటల జాబితా' : 'Telangana & AP Official GI Heritage Crop Registry'}
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            5 Protected Heritage Breeds
          </span>
        </div>

        {/* Heritage Crop Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HERITAGE_CROP_REGISTRY.map((crop) => {
            const isSelected = crop.id === selectedCropId;
            return (
              <div
                key={crop.id}
                onClick={() => setSelectedCropId(crop.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-950 text-white border-amber-500 shadow-lg ring-2 ring-amber-500/40'
                    : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-800 text-amber-200' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {crop.badgeLabel}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${
                    isSelected ? 'text-emerald-300' : 'text-emerald-700'
                  }`}>
                    +₹{crop.procurementBonusInrPerQtl}/Qtl Bonus
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold leading-tight">
                  {language === 'te' ? crop.cropNameTe : crop.cropNameEn}
                </h4>

                <p className={`text-xs mt-1.5 line-clamp-2 ${isSelected ? 'text-amber-100/80' : 'text-stone-500'}`}>
                  {crop.designatedRegion}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Crop Deep-Dive Dossier */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Dossier Header */}
          <div className="p-6 bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-950 bg-amber-200/80 px-2.5 py-0.5 rounded-md">
                  {activeHeritageCrop.giTagNumber}
                </span>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                  Region: {activeHeritageCrop.designatedRegion}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  Code: {activeHeritageCrop.pjtsauCertificationCode}
                </span>
              </div>
              <h3 className="text-xl font-black text-stone-950 pt-1">
                {language === 'te' ? activeHeritageCrop.cropNameTe : activeHeritageCrop.cropNameEn}
              </h3>
            </div>

            <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center shrink-0 shadow-xs">
              <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Heritage Conservation Bonus</div>
              <div className="text-xl font-extrabold text-emerald-300">
                +₹{activeHeritageCrop.procurementBonusInrPerQtl}
                <span className="text-xs font-normal text-emerald-200"> / Qtl</span>
              </div>
            </div>
          </div>

          {/* Dossier Body Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Traits & Soil Ecology */}
            <div className="space-y-4">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>{language === 'te' ? 'విశిష్ట వారసత్వ లక్షణాలు & పోషక విలువలు' : 'Unique Heirloom Traits & Nutritional Advantage'}</span>
                </div>
                <p className="text-xs sm:text-[13px] text-stone-800 leading-relaxed font-medium">
                  {language === 'te' ? activeHeritageCrop.uniqueHeritageTraitTe : activeHeritageCrop.uniqueHeritageTraitEn}
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'te' ? 'నేల స్వభావం & పర్యావరణ అవసరాలు' : 'Soil Ecology & Climatic Requirements'}</span>
                </div>
                <p className="text-xs sm:text-[13px] text-stone-800 leading-relaxed font-medium">
                  {language === 'te' ? activeHeritageCrop.soilEcologyRequirementTe : activeHeritageCrop.soilEcologyRequirementEn}
                </p>
              </div>

              {/* Threats to Genetic Heritage */}
              <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-200 space-y-2.5">
                <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>{language === 'te' ? 'వారసత్వానికి పొంచి ఉన్న ప్రమాదాలు' : 'Key Ecological & Market Threats'}</span>
                </div>
                <div className="space-y-1.5">
                  {(language === 'te' ? activeHeritageCrop.ecologicalRiskFactorsTe : activeHeritageCrop.ecologicalRiskFactorsEn).map((threat, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2 text-xs text-rose-950 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{threat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Conservation Guidelines & Action */}
            <div className="space-y-4">
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 space-y-3">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 border-b border-emerald-200/80 pb-2">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'te' ? 'పీజేటీఎస్ఏయూ పరిరక్షణ నిబంధనలు (Protocols)' : 'PJTSAU & ICAR-NBPGR Conservation Protocols'}</span>
                </div>

                <div className="space-y-2.5">
                  {(language === 'te' ? activeHeritageCrop.conservationProtocolsTe : activeHeritageCrop.conservationProtocolsEn).map((protocol, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs sm:text-[13px] text-stone-800 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{protocol}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cellular SMS for Heritage Sowing */}
              <div className="bg-[#a4c297] text-stone-950 p-4 rounded-xl border-2 border-stone-600 shadow-inner space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] font-bold opacity-75">
                  <span>OFFICIAL HERITAGE CELLULAR ADVISORY</span>
                  <span>160 CHARS (GSM-7)</span>
                </div>
                <p className="font-bold text-xs leading-snug">
                  {language === 'te'
                    ? `${activeHeritageCrop.cropNameTe}: స్వచ్ఛమైన విత్తనాలు వాడండి. GI గుర్తింపు బోనస్ రూ.${activeHeritageCrop.procurementBonusInrPerQtl}/క్విం. కల్తీ హైబ్రిడ్లతో వారసత్వాన్ని పాడుచేయకండి.`
                    : `HERITAGE ALERT: Cultivate certified ${activeHeritageCrop.cropNameEn} (${activeHeritageCrop.giTagNumber}). Avail +Rs.${activeHeritageCrop.procurementBonusInrPerQtl}/Qtl bonus. Zero uncertified GMOs.`}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-600/30 font-sans">
                  <button
                    onClick={() => handleCopy(
                      language === 'te'
                        ? `${activeHeritageCrop.cropNameTe}: స్వచ్ఛమైన విత్తనాలు వాడండి. GI గుర్తింపు బోనస్ రూ.${activeHeritageCrop.procurementBonusInrPerQtl}/క్విం. కల్తీ హైబ్రిడ్లతో వారసత్వాన్ని పాడుచేయకండి.`
                        : `HERITAGE ALERT: Cultivate certified ${activeHeritageCrop.cropNameEn} (${activeHeritageCrop.giTagNumber}). Avail +Rs.${activeHeritageCrop.procurementBonusInrPerQtl}/Qtl bonus. Zero uncertified GMOs.`,
                      activeHeritageCrop.id
                    )}
                    className="inline-flex items-center gap-1 text-[11px] bg-stone-900 text-white px-2.5 py-1 rounded-md font-semibold hover:bg-stone-800 active:scale-95 transition-all"
                  >
                    {copiedId === activeHeritageCrop.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Advisory SMS</span>
                      </>
                    )}
                  </button>

                  {onNavigateToSms && (
                    <button
                      onClick={() => onNavigateToSms(
                        language === 'te'
                          ? `${activeHeritageCrop.cropNameTe}: స్వచ్ఛమైన విత్తనాలు వాడండి. GI గుర్తింపు బోనస్ రూ.${activeHeritageCrop.procurementBonusInrPerQtl}/క్విం. కల్తీ హైబ్రిడ్లతో వారసత్వాన్ని పాడుచేయకండి.`
                          : `HERITAGE ALERT: Cultivate certified ${activeHeritageCrop.cropNameEn} (${activeHeritageCrop.giTagNumber}). Avail +Rs.${activeHeritageCrop.procurementBonusInrPerQtl}/Qtl bonus. Zero uncertified GMOs.`
                      )}
                      className="inline-flex items-center gap-1 text-[11px] text-stone-950 font-bold hover:underline"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Transmit to Keypad Phone</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Direct Link to FCI Procurement Hub */}
              {onNavigateToGovt && (
                <button
                  onClick={onNavigateToGovt}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pre-Register Heirloom Batch with FCI Procurement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
