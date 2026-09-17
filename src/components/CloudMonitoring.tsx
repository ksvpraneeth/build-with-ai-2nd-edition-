import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Database, 
  UploadCloud, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Radio, 
  MapPin, 
  FileText,
  Activity,
  Layers
} from 'lucide-react';
import { FarmerCloudRecord, SyncStatusState, CropType, SoilType, IrrigationType, Language } from '../types';
import { OfflineSyncManager } from '../utils/offlineSync';
import { TELANGANA_DISTRICTS, CLOUD_METEOROLOGY_STATIONS, CROPS_METADATA } from '../data/telanganaHistoricalData';
import { TRANSLATIONS } from '../data/translations';

interface CloudMonitoringProps {
  language: Language;
  syncState: SyncStatusState;
  onManualSync: () => void;
}

export const CloudMonitoring: React.FC<CloudMonitoringProps> = ({
  language,
  syncState,
  onManualSync,
}) => {
  const t = TRANSLATIONS[language];

  // Records state
  const [cloudRecords, setCloudRecords] = useState<FarmerCloudRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(true);

  // Form states
  const [farmerName, setFarmerName] = useState<string>('');
  const [village, setVillage] = useState<string>('');
  const [districtId, setDistrictId] = useState<string>('warangal');
  const [crop, setCrop] = useState<CropType>('paddy');
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(3.0);
  const [soilType, setSoilType] = useState<SoilType>('clay_loam');
  const [irrigationType, setIrrigationType] = useState<IrrigationType>('kaleshwaram_canal');
  const [recordedRainfallMm, setRecordedRainfallMm] = useState<number>(45);
  const [actualYield, setActualYield] = useState<number>(26.5);
  const [notes, setNotes] = useState<string>('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Fetch initial records from cloud or cache
  useEffect(() => {
    async function loadRecords() {
      setLoadingRecords(true);
      try {
        if (syncState.isOnline) {
          const res = await fetch('/api/cloud-records');
          if (res.ok) {
            const data = await res.json();
            if (data.records) {
              setCloudRecords(data.records);
              OfflineSyncManager.setCachedRecords(data.records);
              setLoadingRecords(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch cloud records, falling back to local cache:', e);
      }

      // Fallback to local cache
      const cached = OfflineSyncManager.getCachedRecords();
      setCloudRecords(cached);
      setLoadingRecords(false);
    }

    loadRecords();
  }, [syncState.isOnline]);

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim()) return;

    const newRecord = OfflineSyncManager.addRecord({
      farmerName,
      village,
      districtId,
      crop,
      farmSizeAcres,
      soilType,
      irrigationType,
      recordedRainfallMm,
      actualYieldQuintalPerAcre: actualYield,
      notes,
    });

    // Update UI immediately
    setCloudRecords(prev => [newRecord, ...prev]);

    setFormSuccessMessage(
      syncState.isOnline 
        ? 'Field observation successfully saved & synced to Telangana Cloud Storage.'
        : 'Saved to local offline queue. Will automatically sync to cloud when connected.'
    );

    // Reset inputs
    setFarmerName('');
    setVillage('');
    setNotes('');

    setTimeout(() => setFormSuccessMessage(null), 5000);
  };

  const getDistrictName = (id: string) => {
    const d = TELANGANA_DISTRICTS.find(item => item.id === id);
    if (!d) return id;
    return language === 'te' ? d.nameTe : language === 'hi' ? d.nameHi : language === 'ur' ? d.nameUr : d.nameEn;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Cloud & Offline Architecture Overview Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>{t.cloudRecordsTitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Telangana Cloud Climate & Long-Term Agronomy Storage
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
            {t.offlineNotice}
          </p>
        </div>

        {/* Sync Status Badge and Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-stone-800/80 p-3 rounded-lg border border-stone-700">
          <div className="flex items-center space-x-2">
            {syncState.isOnline ? (
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-amber-500" />
            )}
            <span className="text-xs font-semibold text-stone-200">
              {syncState.isOnline ? t.onlineStatus : t.offlineStatus}
            </span>
          </div>

          <button
            onClick={onManualSync}
            disabled={syncState.isSyncing || !syncState.isOnline || syncState.pendingCount === 0}
            className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-bounce' : ''}`} />
            <span>{syncState.isSyncing ? 'Syncing...' : `${t.syncNow} (${syncState.pendingCount})`}</span>
          </button>
        </div>
      </div>

      {/* Meteorological AWS Stations Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Telangana Automatic Weather Stations (AWS Network)</span>
            </h3>
            <p className="text-xs text-stone-500">
              Live telemetry feed from research stations across agro-climatic zones
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            5 Stations Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLOUD_METEOROLOGY_STATIONS.map((station) => (
            <div key={station.id} className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                    {station.id} • {station.district}
                  </span>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm mt-0.5 leading-snug">
                    {station.stationName}
                  </h4>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Station Online" />
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
                <div className="p-1.5 rounded bg-stone-50">
                  <span className="text-[10px] text-stone-500 block">Temp</span>
                  <span className="text-xs font-bold text-stone-900">{station.currentTempC}°C</span>
                </div>
                <div className="p-1.5 rounded bg-stone-50">
                  <span className="text-[10px] text-stone-500 block">Humidity</span>
                  <span className="text-xs font-bold text-blue-700">{station.humidityPct}%</span>
                </div>
                <div className="p-1.5 rounded bg-stone-50">
                  <span className="text-[10px] text-stone-500 block">Rainfall</span>
                  <span className="text-xs font-bold text-emerald-700">{station.rainfallTodayMm} mm</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Soil Moisture: <strong>{station.soilMoisturePct}%</strong></span>
                <span>Ping: {station.lastPing.slice(11)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Farmer Field Observation Logger (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-2">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>{t.addNewObservation}</span>
            </h3>
            <p className="text-xs text-stone-500">
              Records are locally encrypted & automatically synced when connected.
            </p>
          </div>

          {formSuccessMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitRecord} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.farmerName} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Reddy / K. Mallamma"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.villageName}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thorrur, Warangal"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.selectDistrict}
                </label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {TELANGANA_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {getDistrictName(d.id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.selectCrop}
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value as CropType)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.keys(CROPS_METADATA).map((k) => (
                    <option key={k} value={k}>
                      {CROPS_METADATA[k as CropType].icon} {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.farmArea}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={farmSizeAcres}
                  onChange={(e) => setFarmSizeAcres(parseFloat(e.target.value) || 1)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Observed Rain (mm)
                </label>
                <input
                  type="number"
                  value={recordedRainfallMm}
                  onChange={(e) => setRecordedRainfallMm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.enterYield}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={actualYield}
                  onChange={(e) => setActualYield(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Field Notes & Pest Observations
              </label>
              <textarea
                rows={2}
                placeholder="Cultivar used, pest incidents, water schedule..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{t.saveRecord}</span>
            </button>
          </form>
        </div>

        {/* Right: Cloud Storage Records & Long-Term Audit Trail (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
            <div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Long-Term Cloud Agronomy Records ({cloudRecords.length})
              </h3>
              <p className="text-xs text-stone-500">
                Audited farmer logs stored securely on the Telangana Cloud Storage service
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
              Immutable Records
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {loadingRecords ? (
              <div className="py-8 text-center text-xs text-stone-500">
                Loading records from cloud database...
              </div>
            ) : cloudRecords.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                No farmer observation records found. Submit one using the form on the left.
              </div>
            ) : (
              cloudRecords.map((rec) => (
                <div 
                  key={rec.id}
                  className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-white transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm">
                        {rec.farmerName}
                      </span>
                      <span className="text-stone-500 text-xs ml-2">
                        {rec.village ? `${rec.village}, ` : ''}{getDistrictName(rec.districtId)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {rec.actualYieldQuintalPerAcre} Qtl/Ac
                      </span>
                      {rec.status === 'synced' ? (
                        <span className="flex items-center space-x-1 text-[11px] text-emerald-700 font-semibold" title="Cloud Synced">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Synced</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-[11px] text-amber-700 font-semibold" title="Pending Sync">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="hidden sm:inline">Pending Sync</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-stone-600">
                    <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">Crop: {rec.crop}</span>
                    <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">Area: {rec.farmSizeAcres} Ac</span>
                    <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">Rain: {rec.recordedRainfallMm} mm</span>
                  </div>

                  {rec.notes && (
                    <p className="text-xs text-stone-700 italic bg-white p-2 rounded border border-stone-200/70">
                      "{rec.notes}"
                    </p>
                  )}

                  <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1">
                    <span>ID: {rec.id}</span>
                    <span>Logged: {new Date(rec.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
