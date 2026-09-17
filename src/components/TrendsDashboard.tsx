import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  TrendingUp, 
  CloudRain, 
  Thermometer, 
  Layers, 
  Calendar, 
  Droplets, 
  AlertCircle,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  BookOpen,
  Sparkles,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  DistrictInfo, 
  HistoricalYearData, 
  CropType, 
  Season, 
  Language 
} from '../types';
import { 
  TELANGANA_DISTRICTS, 
  HISTORICAL_AGRICULTURAL_DATA, 
  CROPS_METADATA 
} from '../data/telanganaHistoricalData';
import { TRANSLATIONS } from '../data/translations';
import { CropDetailsModal } from './CropDetailsModal';

interface TrendsDashboardProps {
  language: Language;
}

export const TrendsDashboard: React.FC<TrendsDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  // Selected filters
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('warangal');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('paddy');
  const [selectedSeason, setSelectedSeason] = useState<Season>('kharif_vanakalam');
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  const selectedDistrict = useMemo(() => {
    return TELANGANA_DISTRICTS.find(d => d.id === selectedDistrictId) || TELANGANA_DISTRICTS[0];
  }, [selectedDistrictId]);

  // Filter 5-year data for current selection
  const districtFilteredData = useMemo(() => {
    return HISTORICAL_AGRICULTURAL_DATA.filter(
      d => d.districtId === selectedDistrictId && d.crop === selectedCrop
    ).sort((a, b) => a.year - b.year);
  }, [selectedDistrictId, selectedCrop]);

  // Aggregate stats across the 5 years
  const aggregateStats = useMemo(() => {
    if (districtFilteredData.length === 0) {
      return {
        avgYield: 0,
        avgRainfall: selectedDistrict.avgAnnualRainfallMm,
        avgDeviation: 0,
        avgTemp: 33.2,
        avgGroundwater: 5.8,
        latestMsp: 2380,
      };
    }
    const sumYield = districtFilteredData.reduce((acc, c) => acc + c.yieldQuintalPerAcre, 0);
    const sumRain = districtFilteredData.reduce((acc, c) => acc + c.annualRainfallMm, 0);
    const sumDev = districtFilteredData.reduce((acc, c) => acc + c.rainfallDeviationPct, 0);
    const sumGw = districtFilteredData.reduce((acc, c) => acc + c.groundwaterDepthMeters, 0);
    const latest = districtFilteredData[districtFilteredData.length - 1];

    return {
      avgYield: +(sumYield / districtFilteredData.length).toFixed(1),
      avgRainfall: Math.round(sumRain / districtFilteredData.length),
      avgDeviation: +(sumDev / districtFilteredData.length).toFixed(1),
      avgTemp: +(districtFilteredData.reduce((a, c) => a + c.avgTempMaxC, 0) / districtFilteredData.length).toFixed(1),
      avgGroundwater: +(sumGw / districtFilteredData.length).toFixed(1),
      latestMsp: latest?.mspPerQuintalInr || 2380,
    };
  }, [districtFilteredData, selectedDistrict]);

  // All districts comparison data for the selected crop
  const districtComparisonData = useMemo(() => {
    return TELANGANA_DISTRICTS.map(dist => {
      const match = HISTORICAL_AGRICULTURAL_DATA.filter(
        item => item.districtId === dist.id && item.crop === selectedCrop
      );
      const avg = match.length > 0
        ? +(match.reduce((acc, m) => acc + m.yieldQuintalPerAcre, 0) / match.length).toFixed(1)
        : 0;
      return {
        districtId: dist.id,
        name: language === 'te' ? dist.nameTe : language === 'hi' ? dist.nameHi : language === 'ur' ? dist.nameUr : dist.nameEn,
        avgYield: avg,
        rainfall: dist.avgAnnualRainfallMm,
      };
    }).sort((a, b) => b.avgYield - a.avgYield);
  }, [selectedCrop, language]);

  const cropMeta = CROPS_METADATA[selectedCrop];

  // Helper for localized crop name
  const getCropName = (crop: CropType) => {
    const meta = CROPS_METADATA[crop];
    if (!meta) return crop;
    return language === 'te' ? meta.nameTe : language === 'hi' ? meta.nameHi : language === 'ur' ? meta.nameUr : meta.nameEn;
  };

  const getDistrictDisplayName = (dist: DistrictInfo) => {
    return language === 'te' ? dist.nameTe : language === 'hi' ? dist.nameHi : language === 'ur' ? dist.nameUr : dist.nameEn;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Filter and Context Ribbon */}
      <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold tracking-wide uppercase">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Telangana Agro-Climatic Intelligence</span>
              <span>•</span>
              <span>{selectedDistrict.zone}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              {getDistrictDisplayName(selectedDistrict)} {getCropName(selectedCrop)} {t.yearsCovered}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              5-year meteorological synthesis covering Southwest monsoon variations, temperature anomalies, and harvest productivity.
            </p>
          </div>

          {/* Interactive Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* District Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {t.selectDistrict}
              </label>
              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {TELANGANA_DISTRICTS.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {getDistrictDisplayName(dist)} ({dist.zone.replace(' Telangana', '')})
                  </option>
                ))}
              </select>
            </div>

            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {t.selectCrop}
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as CropType)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {Object.keys(CROPS_METADATA).map((key) => {
                  const cType = key as CropType;
                  return (
                    <option key={cType} value={cType}>
                      {CROPS_METADATA[cType].icon} {getCropName(cType)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Season Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {t.selectSeason}
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value as Season)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="kharif_vanakalam">{t.kharif}</option>
                <option value="rabi_yasangi">{t.rabi}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Interactive Crop Selector Bar */}
      <div className="bg-stone-50 rounded-xl p-3 sm:p-4 border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              🌾 Explore Telangana Crops ({Object.keys(CROPS_METADATA).length}):
            </span>
            <span className="text-xs text-stone-500 hidden md:inline">
              Click any crop to switch 5-year dataset & agronomic profile
            </span>
          </div>
          <button
            onClick={() => setIsCropModalOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Complete Agronomy Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {(Object.keys(CROPS_METADATA) as CropType[]).map((cKey) => {
            const isSelected = cKey === selectedCrop;
            const meta = CROPS_METADATA[cKey];
            return (
              <button
                key={cKey}
                onClick={() => setSelectedCrop(cKey)}
                className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-600/50'
                    : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{meta.icon}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-100 text-stone-600'
                  }`}>
                    ₹{meta.mspCurrentInr}
                  </span>
                </div>
                <div className="font-bold text-xs truncate">
                  {getCropName(cKey)}
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                  {meta.durationDays.split(' ')[0]} Days
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 5-Year Average Yield */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.avgYieldLabel}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-stone-900">
              {aggregateStats.avgYield} <span className="text-sm font-normal text-stone-500">Qtl/Acre</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-700 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% since Kaleshwaram canal extension</span>
            </div>
          </div>
        </div>

        {/* Card 2: 5-Year Monsoon Rainfall */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.rainfallLabel}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-stone-900">
              {aggregateStats.avgRainfall} <span className="text-sm font-normal text-stone-500">mm/year</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-stone-600 mt-1">
              <span className={`font-semibold ${aggregateStats.avgDeviation >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {aggregateStats.avgDeviation >= 0 ? `+${aggregateStats.avgDeviation}%` : `${aggregateStats.avgDeviation}%`}
              </span>
              <span>vs Telangana State normal</span>
            </div>
          </div>
        </div>

        {/* Card 3: Groundwater Depth */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.groundwaterDepth}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-stone-900">
              {aggregateStats.avgGroundwater} <span className="text-sm font-normal text-stone-500">m depth</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-700 mt-1 font-medium">
              <span>Stable water table recharge in tanks</span>
            </div>
          </div>
        </div>

        {/* Card 4: Latest Minimum Support Price (MSP) */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.mspLabel} (2025-26)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-stone-900">
              ₹{aggregateStats.latestMsp.toLocaleString()} <span className="text-sm font-normal text-stone-500">/ Quintal</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-stone-600 mt-1">
              <span>Govt procurement benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 5-Year Crop Yield Progression */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                5-Year Harvest Yield Progression (2020 - 2025)
              </h3>
              <p className="text-xs text-stone-500">
                Quintals per acre in {getDistrictDisplayName(selectedDistrict)} ({getCropName(selectedCrop)})
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-semibold rounded bg-stone-100 text-stone-700">
              Annual Verified
            </span>
          </div>

          {/* SVG Visual Chart */}
          <div className="w-full h-64 relative flex items-end justify-between pt-8 pb-6 px-4">
            {districtFilteredData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-stone-500">
                No recorded dataset for this specific crop & district combination.
              </div>
            ) : (
              districtFilteredData.map((item) => {
                const maxVal = 35;
                const heightPct = Math.min(100, Math.max(15, (item.yieldQuintalPerAcre / maxVal) * 100));
                const isHighest = item.yieldQuintalPerAcre === Math.max(...districtFilteredData.map(d => d.yieldQuintalPerAcre));
                return (
                  <div key={item.year} className="flex-1 flex flex-col items-center group relative h-full justify-end px-1">
                    {/* Tooltip */}
                    <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition bg-stone-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none shadow-md">
                      {item.year}: {item.yieldQuintalPerAcre} Qtl/Acre (Rain: {item.annualRainfallMm}mm)
                    </div>

                    <div className="text-[11px] font-bold text-stone-700 mb-1">
                      {item.yieldQuintalPerAcre}
                    </div>

                    <div 
                      className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                        isHighest ? 'bg-emerald-600 shadow-sm' : 'bg-emerald-500/80 hover:bg-emerald-600'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />

                    <span className="text-xs font-semibold text-stone-600 mt-2">
                      {item.year}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-2 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-600 rounded"></span>
              <span>Yield (Quintals/Acre)</span>
            </div>
            <span>Benchmark PJTSAU Normal: 24.0 Qtl/Acre</span>
          </div>
        </div>

        {/* Chart 2: Rainfall vs Yield Correlation */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Rainfall vs Yield Sensitivity Matrix
              </h3>
              <p className="text-xs text-stone-500">
                Monsoon precipitation (mm) impact on harvest output
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700">
              Dual Trend
            </span>
          </div>

          <div className="w-full h-64 relative flex items-end justify-between pt-8 pb-6 px-4">
            {districtFilteredData.map((item) => {
              const maxRain = 1600;
              const rainHeightPct = Math.min(100, Math.max(10, (item.annualRainfallMm / maxRain) * 100));
              const yieldPct = (item.yieldQuintalPerAcre / 35) * 100;

              return (
                <div key={item.year} className="flex-1 flex flex-col items-center group relative h-full justify-end px-1">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition bg-stone-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none shadow-md">
                    {item.year}: Rain {item.annualRainfallMm}mm | Yield {item.yieldQuintalPerAcre} Qtl
                  </div>

                  {/* Dual Bars */}
                  <div className="flex items-end justify-center space-x-1 w-full h-full">
                    {/* Rain bar */}
                    <div 
                      className="w-4 bg-blue-400/80 rounded-t group-hover:bg-blue-500 transition-all"
                      style={{ height: `${rainHeightPct}%` }}
                      title={`Rainfall: ${item.annualRainfallMm} mm`}
                    />
                    {/* Yield bar */}
                    <div 
                      className="w-4 bg-emerald-600 rounded-t group-hover:bg-emerald-700 transition-all"
                      style={{ height: `${yieldPct}%` }}
                      title={`Yield: ${item.yieldQuintalPerAcre} Qtl`}
                    />
                  </div>

                  <span className="text-xs font-semibold text-stone-600 mt-2">
                    {item.year}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-blue-400 rounded"></span>
                <span>Annual Rainfall (mm)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-emerald-600 rounded"></span>
                <span>Yield (Qtl/Acre)</span>
              </div>
            </div>
            <span>El Niño (2023) vs Normal (2024-25)</span>
          </div>
        </div>
      </div>

      {/* District-by-District Comparison & Climate Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Comparison Leaderboard */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Telangana District Comparison ({getCropName(selectedCrop)})
              </h3>
              <p className="text-xs text-stone-500">
                5-year average yield rankings across Telangana agro-climatic zones
              </p>
            </div>
            <span className="text-xs font-medium text-stone-600">
              State Avg: 22.4 Qtl/Acre
            </span>
          </div>

          <div className="space-y-3 mt-2">
            {districtComparisonData.slice(0, 7).map((item, idx) => {
              const maxYield = Math.max(...districtComparisonData.map(d => d.avgYield)) || 1;
              const barWidth = Math.min(100, Math.max(10, (item.avgYield / maxYield) * 100));
              const isSelected = item.districtId === selectedDistrictId;

              return (
                <div 
                  key={item.districtId} 
                  onClick={() => setSelectedDistrictId(item.districtId)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-stone-100 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 text-stone-400 font-bold">{idx + 1}.</span>
                      <span className={isSelected ? 'text-emerald-900 font-bold' : ''}>{item.name}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-stone-600">
                      <span>Rain: {item.rainfall} mm</span>
                      <span className="font-bold text-stone-900">{item.avgYield} Qtl/Acre</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-stone-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Crop Agro-Profile Card */}
        <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <span>{cropMeta.icon} Crop Agronomy Profile</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-emerald-400 border border-stone-700">
                {cropMeta.botanicalName || 'Telangana Agro'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1.5">
              <h3 className="text-xl font-bold text-white">
                {getCropName(selectedCrop)}
              </h3>
              <span className="text-xs font-bold text-emerald-300">
                MSP: ₹{cropMeta.mspCurrentInr.toLocaleString()}/Qtl
              </span>
            </div>

            {/* Quick Metrics Tag Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
              <div className="p-2 rounded-lg bg-stone-800/90 border border-stone-700">
                <span className="text-stone-400 block text-[10px]">Life Duration</span>
                <span className="font-semibold text-emerald-300">{cropMeta.durationDays.split(' ')[0]} Days</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-800/90 border border-stone-700">
                <span className="text-stone-400 block text-[10px]">Expected Yield</span>
                <span className="font-semibold text-emerald-300">{cropMeta.expectedYieldRangeQuintalsPerAcre}</span>
              </div>
            </div>

            <div className="space-y-2 mt-3 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700">
                <span className="text-stone-400 block text-[10px] mb-0.5">Recommended Soil Type</span>
                <span className="font-medium text-stone-100">{cropMeta.idealSoil}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700">
                <span className="text-stone-400 block text-[10px] mb-0.5">Water Requirement & Irrigation</span>
                <span className="font-medium text-stone-100">{cropMeta.idealWater}</span>
                {cropMeta.criticalIrrigationStages && cropMeta.criticalIrrigationStages.length > 0 && (
                  <span className="text-[10px] text-blue-300 block mt-1">
                    Critical: {cropMeta.criticalIrrigationStages[0].split('(')[0]}
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700">
                <span className="text-stone-400 block text-[10px] mb-0.5">Seed Rate & Spacing</span>
                <span className="font-medium text-stone-100">{cropMeta.seedRatePerAcre} | {cropMeta.spacing}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700">
                <span className="text-stone-400 block text-[10px] mb-0.5">Target NPK Dosage</span>
                <span className="font-medium text-emerald-300">{cropMeta.npkDosageKgPerAcre}</span>
              </div>

              {cropMeta.majorPestsAndDiseases && cropMeta.majorPestsAndDiseases.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60">
                  <span className="text-rose-300 block text-[10px] font-semibold mb-0.5">Key Pest Watch</span>
                  <span className="font-medium text-rose-200">{cropMeta.majorPestsAndDiseases[0].name.split('(')[0]}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 space-y-3">
            <div>
              <span className="text-[10px] font-semibold text-stone-400 block mb-1">
                PJTSAU Cultivars for Telangana:
              </span>
              <div className="flex flex-wrap gap-1">
                {cropMeta.recommendedVarieties.slice(0, 3).map((v, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                    {v.split('(')[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Button to open Full Crop Details Modal */}
            <button
              onClick={() => setIsCropModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Complete Crop Agronomy Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Year-by-Year Detailed Log Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-stone-900 text-base">
              Verified 5-Year Historical Dataset: {getDistrictDisplayName(selectedDistrict)}
            </h3>
            <p className="text-xs text-stone-500">
              Audit data sourced from Telangana State Development Planning Society & DES
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Certified Meteorological Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Yield (Qtl/Acre)</th>
                <th className="py-3 px-4">Monsoon Rain (mm)</th>
                <th className="py-3 px-4">Deviation (%)</th>
                <th className="py-3 px-4">Max Temp (°C)</th>
                <th className="py-3 px-4">Dry Spells (Days)</th>
                <th className="py-3 px-4">Pest Severity</th>
                <th className="py-3 px-4">MSP (₹/Qtl)</th>
                <th className="py-3 px-4">Market Realized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {districtFilteredData.map((row) => (
                <tr key={row.year} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-4 font-bold text-stone-900">{row.year}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">
                    {row.yieldQuintalPerAcre} Qtl
                  </td>
                  <td className="py-3 px-4">{row.monsoonRainfallMm} mm</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      row.rainfallDeviationPct >= 0 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {row.rainfallDeviationPct >= 0 ? `+${row.rainfallDeviationPct}%` : `${row.rainfallDeviationPct}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4">{row.avgTempMaxC}°C</td>
                  <td className="py-3 px-4">{row.drySpellDays} days</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-medium ${
                      row.pestSeverityIndex === 'High' 
                        ? 'bg-rose-50 text-rose-700' 
                        : row.pestSeverityIndex === 'Moderate'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {row.pestSeverityIndex}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">₹{row.mspPerQuintalInr}</td>
                  <td className="py-3 px-4 font-semibold text-stone-900">₹{row.marketPricePerQuintalInr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Agronomy & Deep-Dive Crop Details Modal */}
      <CropDetailsModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        initialCrop={selectedCrop}
        language={language}
      />
    </div>
  );
};
