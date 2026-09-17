import React from 'react';
import { 
  Sprout, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Languages, 
  BarChart3, 
  BrainCircuit, 
  AlertTriangle, 
  CloudRain, 
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Smartphone,
  Scan,
  Bot,
  Sparkles,
  Compass,
  ShieldCheck
} from 'lucide-react';
import { Language, SyncStatusState } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  syncState: SyncStatusState;
  onManualSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  syncState,
  onManualSync,
}) => {
  const t = TRANSLATIONS[language];

  const tabs = [
    { id: 'ai_assistant', label: t.navAiAssistant || 'Rythu AI Assistant', icon: Bot, isSpecial: true },
    { id: 'scenarios', label: t.navScenarios || 'Scenario Recommendations', icon: Compass },
    { id: 'crop_heritage', label: t.navCropHeritage || 'Crop Heritage & GI Protection', icon: ShieldCheck },
    { id: 'procurement_hub', label: t.navProcurementHub, icon: Building2 },
    { id: 'sms_gateway', label: t.navSmsGateway, icon: Smartphone },
    { id: 'suitability_scanner', label: t.navSuitabilityScanner, icon: Scan },
    { id: 'trends', label: t.navTrends, icon: BarChart3 },
    { id: 'predictor', label: t.navPredictor, icon: BrainCircuit },
    { id: 'alerts', label: t.navAlerts, icon: AlertTriangle },
    { id: 'monitoring', label: t.navMonitoring, icon: CloudRain },
    { id: 'audit', label: t.navAudit, icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-50 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-md">
      {/* Top Banner: Brand + Status + Language */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('trends')}>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center shadow-inner border border-emerald-400/30">
            <Sprout className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                {t.appTitle}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Telangana State
                </span>
              </h1>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls: Network/Sync & Language Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Offline / Online status badge */}
          <div className="flex items-center">
            {syncState.isOnline ? (
              <div 
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium"
                title={t.onlineStatus}
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">{t.onlineStatus}</span>
              </div>
            ) : (
              <div 
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700 text-amber-300 text-xs font-medium animate-pulse"
                title={t.offlineStatus}
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.offlineStatus}</span>
              </div>
            )}
          </div>

          {/* Sync Trigger Button */}
          {syncState.pendingCount > 0 ? (
            <button
              onClick={onManualSync}
              disabled={syncState.isSyncing || !syncState.isOnline}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs shadow transition disabled:opacity-50"
              title={`${syncState.pendingCount} ${t.syncPending}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncState.pendingCount} {t.syncPending}</span>
            </button>
          ) : (
            <div 
              className="hidden lg:flex items-center space-x-1 text-xs text-stone-400 px-2 py-1 bg-stone-800/60 rounded border border-stone-700/50"
              title={t.syncedJustNow}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Synced</span>
            </div>
          )}

          {/* Regional Language Switcher */}
          <div className="relative flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
            <Languages className="w-3.5 h-3.5 text-stone-400 ml-2 mr-1" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs text-stone-200 font-medium py-1 pr-2 pl-1 rounded focus:outline-none cursor-pointer"
              aria-label="Select regional language"
            >
              <option value="te" className="bg-stone-900 text-stone-100">తెలుగు (Telugu)</option>
              <option value="en" className="bg-stone-900 text-stone-100">English</option>
              <option value="hi" className="bg-stone-900 text-stone-100">हिंदी (Hindi)</option>
              <option value="ur" className="bg-stone-900 text-stone-100">اردو (Urdu)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : tab.isSpecial
                    ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 hover:bg-emerald-900 hover:text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.isSpecial ? 'text-emerald-400' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
                {tab.isSpecial && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider border border-emerald-400/30">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
