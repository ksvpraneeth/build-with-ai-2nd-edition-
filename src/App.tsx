import React, { useState, useEffect } from 'react';
import { Language, SyncStatusState } from './types';
import { Navbar } from './components/Navbar';
import { GovtProcurementDashboard } from './components/GovtProcurementDashboard';
import { FarmerSmsGateway } from './components/FarmerSmsGateway';
import { SuitabilityScanner } from './components/SuitabilityScanner';
import { TrendsDashboard } from './components/TrendsDashboard';
import { YieldPredictor } from './components/YieldPredictor';
import { WeatherAlerts } from './components/WeatherAlerts';
import { CloudMonitoring } from './components/CloudMonitoring';
import { AuditReports } from './components/AuditReports';
import { RythuAiAssistant } from './components/RythuAiAssistant';
import { ScenarioRecommendationsView } from './components/ScenarioRecommendationsView';
import { CropHeritageProtectionView } from './components/CropHeritageProtectionView';
import { OfflineSyncManager } from './utils/offlineSync';
import { TRANSLATIONS } from './data/translations';
import { Bot, Sparkles, X, Maximize2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('ai_assistant');
  const [language, setLanguage] = useState<Language>('te');
  const [isFloatingAssistantOpen, setIsFloatingAssistantOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncStatusState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    lastSyncedAt: null,
    isSyncing: false,
  });
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  useEffect(() => {
    OfflineSyncManager.init();
    const unsubscribe = OfflineSyncManager.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    const result = await OfflineSyncManager.triggerAutoSync();
    if (result.success && result.syncedCount > 0) {
      setSyncNotification(
        language === 'te'
          ? `${result.syncedCount} రికార్డులు క్లౌడ్‌తో విజయవంతంగా సమకాలీకరించబడ్డాయి.`
          : `Successfully synchronized ${result.syncedCount} field records with Telangana Cloud Storage.`
      );
      setTimeout(() => setSyncNotification(null), 4000);
    }
  };

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      {/* Sticky Header / Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        syncState={syncState}
        onManualSync={handleManualSync}
      />

      {/* Sync Notification Banner if triggered */}
      {syncNotification && (
        <div className="bg-emerald-700 text-white text-xs font-semibold px-4 py-2 text-center shadow-inner flex items-center justify-center space-x-2 animate-fadeIn">
          <span>✓ {syncNotification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'ai_assistant' && (
          <RythuAiAssistant
            language={language}
            mode="full"
            onNavigateToSms={() => setCurrentTab('sms_gateway')}
            onNavigateToGovt={() => setCurrentTab('procurement_hub')}
          />
        )}
        {currentTab === 'scenarios' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ScenarioRecommendationsView
              language={language}
              onSelectScenarioForAi={() => setCurrentTab('ai_assistant')}
              onNavigateToSms={() => setCurrentTab('sms_gateway')}
              onNavigateToGovt={() => setCurrentTab('procurement_hub')}
            />
          </div>
        )}
        {currentTab === 'crop_heritage' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <CropHeritageProtectionView
              language={language}
              onNavigateToAi={() => setCurrentTab('ai_assistant')}
              onNavigateToSms={() => setCurrentTab('sms_gateway')}
              onNavigateToGovt={() => setCurrentTab('procurement_hub')}
            />
          </div>
        )}
        {currentTab === 'procurement_hub' && (
          <GovtProcurementDashboard language={language} />
        )}
        {currentTab === 'sms_gateway' && (
          <FarmerSmsGateway language={language} />
        )}
        {currentTab === 'suitability_scanner' && (
          <SuitabilityScanner
            language={language}
            onNavigateToGovt={() => setCurrentTab('procurement_hub')}
            onNavigateToSms={() => setCurrentTab('sms_gateway')}
          />
        )}
        {currentTab === 'trends' && <TrendsDashboard language={language} />}
        {currentTab === 'predictor' && <YieldPredictor language={language} />}
        {currentTab === 'alerts' && <WeatherAlerts language={language} />}
        {currentTab === 'monitoring' && (
          <CloudMonitoring
            language={language}
            syncState={syncState}
            onManualSync={handleManualSync}
          />
        )}
        {currentTab === 'audit' && <AuditReports language={language} />}
      </main>

      {/* Floating Rythu AI Assistant Widget (Available across all other tabs) */}
      {currentTab !== 'ai_assistant' && (
        <div className="fixed bottom-6 right-6 z-40">
          {!isFloatingAssistantOpen ? (
            <button
              onClick={() => setIsFloatingAssistantOpen(true)}
              className="group flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-4 py-3 rounded-full shadow-2xl border-2 border-emerald-500/40 transition-all"
              aria-label="Open Rythu AI Assistant"
            >
              <div className="relative">
                <Bot className="w-5 h-5 text-emerald-100 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              </div>
              <span className="text-xs font-bold tracking-wide">
                {language === 'te' ? 'రైతు AI అసిస్టెంట్' : 'Rythu AI Assistant'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          ) : (
            <div className="w-[360px] sm:w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between p-3.5 bg-emerald-900 text-white border-b border-emerald-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Rythu Mitra AI Assistant</div>
                    <div className="text-[10px] text-emerald-300 font-mono">Gemini 3.8 Flash • PJTSAU</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsFloatingAssistantOpen(false);
                      setCurrentTab('ai_assistant');
                    }}
                    title="Open Full Screen"
                    className="p-1.5 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsFloatingAssistantOpen(false)}
                    title="Close Assistant"
                    className="p-1.5 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <RythuAiAssistant
                  language={language}
                  mode="floating"
                  onNavigateToSms={() => {
                    setIsFloatingAssistantOpen(false);
                    setCurrentTab('sms_gateway');
                  }}
                  onNavigateToGovt={() => {
                    setIsFloatingAssistantOpen(false);
                    setCurrentTab('procurement_hub');
                  }}
                  onCloseFloating={() => setIsFloatingAssistantOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Agronomic Data Source & Disclaimer Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-stone-700 font-semibold">
            <span>{t.appTitle}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">Kisan-Setu Dual-Interface Procurement Intelligence</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-stone-500 max-w-xl">
            {t.auditDisclaimer} Integrated with National Food Security Reserves (FCI) & 2G GSM Twilio SMS Pipeline.
          </div>
        </div>
      </footer>
    </div>
  );
}
