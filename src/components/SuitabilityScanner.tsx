import React, { useState } from 'react';
import { 
  Scan, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Droplets, 
  Thermometer, 
  CheckCircle2, 
  Send, 
  Compass, 
  Layers, 
  Award,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Language, SuitabilityEvaluationResult } from '../types';
import { REGIONAL_AGRO_REGISTRY, NATIONAL_FOOD_BUFFERS } from '../data/procurementData';

interface SuitabilityScannerProps {
  language: Language;
  onNavigateToGovt?: () => void;
  onNavigateToSms?: () => void;
}

export const SuitabilityScanner: React.FC<SuitabilityScannerProps> = ({ 
  language, 
  onNavigateToGovt, 
  onNavigateToSms 
}) => {
  const [pincode, setPincode] = useState('501141');
  const [selectedCrop, setSelectedCrop] = useState('red_gram');
  const [farmArea, setFarmArea] = useState(4.0);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SuitabilityEvaluationResult | null>(null);
  const [submittedToGovt, setSubmittedToGovt] = useState(false);

  const currentProfile = REGIONAL_AGRO_REGISTRY[pincode] || {
    pincode,
    districtId: 'regional',
    districtName: 'Telangana Agri Zone',
    state: 'Telangana',
    soilClassification: 'Red Chalka / Loam',
    soilPh: 7.0,
    fiveYearAvgRainfallMm: 850,
    fiveYearAvgTempC: 33.0,
    droughtVulnerability: 'Moderate',
    giTagHeritageCrops: ['Telangana Sona Rice'],
    dominantLanguage: 'te',
    heritageEcologyNotes: 'Maintain balanced crop rotation with pulses and oilseeds.',
  };

  const handleScan = async () => {
    setIsScanning(true);
    setSubmittedToGovt(false);
    try {
      const response = await fetch('/api/ai/evaluate-suitability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode,
          crop: selectedCrop,
          farmAreaAcres: farmArea,
          language,
        }),
      });
      const data = await response.json();
      if (data.evaluation) {
        setResult(data.evaluation);
      }
    } catch (err) {
      console.warn('Scan evaluation fallback:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRouteToGovt = async () => {
    if (!result) return;
    try {
      await fetch('/api/sms/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Body: `${pincode} ${selectedCrop}`,
          From: '+91-94401-77889',
          To: '+91-800-KISAN',
          MessageSid: `SM_SCANNER_${Date.now()}`,
        }),
      });
      setSubmittedToGovt(true);
    } catch (e) {
      console.warn('Could not forward to govt feed:', e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12" id="suitability-scanner">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Scan className="w-3.5 h-3.5" />
            <span>Multi-Parameter Suitability Scanner & Heritage GI Guardrail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            5-Year Climate, Soil & Heritage Crop Guardrail Scanner
          </h1>
          <p className="text-emerald-100/80 text-sm max-w-3xl">
            Ingests past 5 years of historical rainfall, temperature, and soil pH data for any regional pincode. Cross-references live National Food Security Buffer deficits and enforces ethical AI guardrails to protect traditional Geographical Indication (GI) heritage crops.
          </p>
        </div>
      </div>

      {/* Control Configuration Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pincode selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>Regional Pincode</span>
            </label>
            <select
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-stone-800"
            >
              <option value="501141">501141 - Tandur (Vikarabad / Red Gram GI)</option>
              <option value="506001">506001 - Warangal (Cotton & Chapata Chilli)</option>
              <option value="507001">507001 - Khammam (Pulses & Chilli Belt)</option>
              <option value="505001">505001 - Karimnagar (SRSP Canal / Paddy)</option>
              <option value="509001">509001 - Mahbubnagar (Semi-Arid Millets)</option>
              <option value="508001">508001 - Nalgonda (Jowar & Red Chalka)</option>
              <option value="522001">522001 - Guntur (Guntur Sannam Chilli GI Zone)</option>
            </select>
          </div>

          {/* Crop selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Proposed Target Crop</span>
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-stone-800"
            >
              <option value="red_gram">Red Gram / Kandulu (Pulses)</option>
              <option value="cotton">Cotton / Patti (Fiber)</option>
              <option value="paddy">Common Paddy / Rice (Cereal)</option>
              <option value="chilli">Chilli / Mirchi (Spices)</option>
              <option value="millets">Millets / Jowar (Nutri-Cereal)</option>
              <option value="soybean">Soybean (Oilseed)</option>
              <option value="groundnut">Groundnut (Oilseed)</option>
            </select>
          </div>

          {/* Farm area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Farm Area (Acres)</label>
            <input
              type="number"
              min={0.5}
              max={50}
              step={0.5}
              value={farmArea}
              onChange={(e) => setFarmArea(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-stone-800"
            />
          </div>

          {/* Action button */}
          <div className="flex items-end">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Synthesizing Data...' : 'Run Suitability Scan'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Regional Context Card */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">{currentProfile.districtName}, {currentProfile.state}</span>
              <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded text-[10px] font-mono">PIN: {pincode}</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              {currentProfile.soilClassification} • pH {currentProfile.soilPh} • 5-Yr Rainfall: <strong>{currentProfile.fiveYearAvgRainfallMm} mm</strong> • Mean Temp: <strong>{currentProfile.fiveYearAvgTempC}°C</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone-500 text-[11px] font-medium">Regional GI Tags:</span>
            {currentProfile.giTagHeritageCrops.map(gi => (
              <span key={gi} className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                <Award className="w-3 h-3 text-amber-700" />
                <span>{gi}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SCAN RESULTS DISPLAY */}
      {result && (
        <div className="space-y-6">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Viability Score */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-stone-500">Agro-Climate Viability</span>
                <div className={`text-3xl font-bold mt-1 ${
                  result.viabilityScore >= 80 ? 'text-emerald-700' : result.viabilityScore >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {result.viabilityScore}%
                </div>
                <span className="text-xs text-stone-500 mt-1 block">Based on 5-year rainfall & soil pH</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            {/* Sustainability Index */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-stone-500">Eco-Sustainability Index</span>
                <div className="text-3xl font-bold text-stone-900 mt-1">{result.sustainabilityScore}%</div>
                <span className="text-xs text-stone-500 mt-1 block">Groundwater & soil preservation</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* National Buffer Match */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-stone-500">National Buffer Alignment</span>
                <div className="text-xl font-bold text-stone-900 mt-1 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    result.nationalBufferStatus === 'CRITICAL_DEFICIT' || result.nationalBufferStatus === 'DEFICIT'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {result.nationalBufferStatus}
                  </span>
                </div>
                <span className="text-xs text-stone-500 mt-1 block">
                  {result.nationalBufferMatch ? 'Bridges central food reserve deficit' : 'Existing central reserve surplus'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
                <Scale className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* HERITAGE GUARDRAIL NOTIFICATION (Crucial Feature 3) */}
          {result.heritageGuardrailTriggered ? (
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <span>ETHICAL HERITAGE GUARDRAIL TRIGGERED: Protected Geographical Indication (GI) Zone</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900">
                {result.heritageConflictWarning}
              </p>
              {result.recommendedAlternative && (
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <span>Sustainable Alternative Recommended:</span>
                  <span className="px-2 py-0.5 bg-amber-200 rounded text-amber-950 font-bold uppercase">
                    {result.recommendedAlternative}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Heritage Crop Check Passed:</strong> Proposed crop preserves local agro-biodiversity and does not encroach on protected GI tag monoculture zones.
              </div>
            </div>
          )}

          {/* Guaranteed MSP & Dispatched 160-Char SMS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Economic Guarantee */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900">Central MSP & Procurement Guarantee</h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {result.mspGuaranteeEligible ? 'Eligible for Pre-Booking' : 'Conditional Procurement'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500">Base MSP Rate:</span>
                  <div className="text-xl font-bold text-stone-900">₹{result.recommendedMspInr.toLocaleString()} / Qtl</div>
                </div>
                {result.procurementIncentiveInr > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-emerald-600 font-medium">National Deficit Bonus:</span>
                    <div className="text-xl font-bold text-emerald-700">+₹{result.procurementIncentiveInr} / Qtl</div>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {result.scientificRationale}
              </p>

              {/* Push to Govt Feed Button */}
              <div className="pt-2">
                <button
                  onClick={handleRouteToGovt}
                  disabled={submittedToGovt}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {submittedToGovt 
                      ? '✓ Successfully Routed to Govt Procurement Feed!' 
                      : 'Route Request to Govt Procurement Feed'}
                  </span>
                </button>
              </div>
            </div>

            {/* Generated 160-Char SMS Preview */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900">160-Character SMS Transmitted to Farmer</h3>
                <span className="text-xs text-stone-400 font-mono">
                  {result.smsAdvisory160.length}/160 characters
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#a4c297] text-stone-950 font-mono text-xs border-2 border-stone-600 shadow-inner space-y-2">
                <div className="text-[10px] opacity-75 font-bold">FROM: TS-GOVT / KISAN-SETU</div>
                <p className="font-bold text-sm leading-relaxed">{result.smsAdvisory160}</p>
                <div className="text-[9px] opacity-60 text-right">GSM-7 • 1 Segment</div>
              </div>

              {result.smsAdvisoryEn && result.smsAdvisoryEn !== result.smsAdvisory160 && (
                <div className="text-[11px] text-stone-500">
                  <strong>English Translation: </strong> {result.smsAdvisoryEn}
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-stone-500">Tested across 2G Nokia & JioBharat handsets</span>
                {onNavigateToSms && (
                  <button
                    onClick={onNavigateToSms}
                    className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Open Phone Keypad</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
