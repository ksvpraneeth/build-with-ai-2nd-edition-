import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  Radio,
  Filter
} from 'lucide-react';
import { WeatherAlert, Language } from '../types';
import { INITIAL_WEATHER_ALERTS, TELANGANA_DISTRICTS } from '../data/telanganaHistoricalData';
import { TRANSLATIONS } from '../data/translations';

interface WeatherAlertsProps {
  language: Language;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Filter alerts
  const filteredAlerts = INITIAL_WEATHER_ALERTS.filter(alert => {
    if (selectedDistrict === 'all') return true;
    return alert.districtId === selectedDistrict;
  });

  const handleSpeech = (alertItem: WeatherAlert) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (speakingId === alertItem.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Select text based on language
    const title = language === 'te' ? alertItem.titleTe : language === 'hi' ? alertItem.titleHi : language === 'ur' ? alertItem.titleUr : alertItem.titleEn;
    const desc = language === 'te' ? alertItem.descriptionTe : language === 'hi' ? alertItem.descriptionHi : language === 'ur' ? alertItem.descriptionUr : alertItem.descriptionEn;
    const actions = language === 'te' ? alertItem.actionItemsTe : alertItem.actionItemsEn;

    const speechText = `${title}. ${desc}. Recommended farmer actions: ${actions.join('. ')}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.92; // Slightly slower for clear agrarian comprehension
    
    // Attempt to match voice language
    const voices = window.speechSynthesis.getVoices();
    if (language === 'te') {
      const teluguVoice = voices.find(v => v.lang.includes('te') || v.name.toLowerCase().includes('telugu'));
      if (teluguVoice) utterance.voice = teluguVoice;
    } else if (language === 'hi') {
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(alertItem.id);
    window.speechSynthesis.speak(utterance);
  };

  const getSeverityBadge = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>{t.severityCritical}</span>
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.severityWarning}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.severityAdvisory}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header and District Filter */}
      <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Telangana Disaster Management & Agro-Meteorology Cell</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            {t.activeAlerts}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Real-time automated warnings for unseasonal hailstorms, pests, and drought stress with actionable farmer guidance.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t.allDistricts}</option>
            {TELANGANA_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {language === 'te' ? d.nameTe : language === 'hi' ? d.nameHi : language === 'ur' ? d.nameUr : d.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weather Alerts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlerts.map((alert) => {
          const isSpeaking = speakingId === alert.id;
          const title = language === 'te' ? alert.titleTe : language === 'hi' ? alert.titleHi : language === 'ur' ? alert.titleUr : alert.titleEn;
          const desc = language === 'te' ? alert.descriptionTe : language === 'hi' ? alert.descriptionHi : language === 'ur' ? alert.descriptionUr : alert.descriptionEn;
          const actions = language === 'te' ? alert.actionItemsTe : alert.actionItemsEn;

          return (
            <div 
              key={alert.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                alert.severity === 'critical' 
                  ? 'border-rose-300 bg-gradient-to-b from-rose-50/20 to-white' 
                  : alert.severity === 'warning'
                  ? 'border-amber-300 bg-gradient-to-b from-amber-50/20 to-white'
                  : 'border-blue-200'
              }`}
            >
              <div>
                {/* Header: Badges & Voice Readout button */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {alert.districtName}
                    </span>
                  </div>

                  {/* Audio Read Aloud Button */}
                  <button
                    onClick={() => handleSpeech(alert)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                      isSpeaking 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                    title={t.listenAdvisory}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{isSpeaking ? 'Stop Audio' : t.listenAdvisory}</span>
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-700 mt-2 leading-relaxed">
                  {desc}
                </p>

                {/* Immediate Action Items (Do's and Don'ts) */}
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.immediateActions}</span>
                  </h4>

                  <ul className="space-y-1.5">
                    {actions.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-stone-800">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span className="leading-normal">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer timestamps */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>Issued: {alert.issuedAt}</span>
                </div>
                <span>Valid until: {alert.validUntil}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rythu Vedika Broadcast Info Banner */}
      <div className="bg-emerald-950 text-emerald-100 rounded-xl p-5 border border-emerald-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              Rythu Vedika Automated Broadcast Dispatch
            </h4>
            <p className="text-xs text-emerald-300">
              Alerts synchronize across 2,601 Rythu Vedikas in Telangana via rural SMS and WhatsApp agronomic bulletins.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-900 border border-emerald-700 text-emerald-200">
          Official PJTSAU Integration
        </span>
      </div>
    </div>
  );
};
