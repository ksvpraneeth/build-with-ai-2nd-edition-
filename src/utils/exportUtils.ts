import { HistoricalYearData, DistrictInfo, CropType } from '../types';

export function exportHistoricalDataToCSV(data: HistoricalYearData[], districts: DistrictInfo[]) {
  const getDistrictName = (id: string) => districts.find(d => d.id === id)?.nameEn || id;

  const headers = [
    'Year',
    'District',
    'Crop',
    'Season',
    'Area_Cultivated_Acres',
    'Total_Production_Tonnes',
    'Yield_Quintal_Per_Acre',
    'Monsoon_Rainfall_mm',
    'Annual_Rainfall_mm',
    'Rainfall_Deviation_Pct',
    'Max_Temp_C',
    'Min_Temp_C',
    'Dry_Spell_Days',
    'Heatwave_Days',
    'Groundwater_Depth_Meters',
    'Pest_Severity_Index',
    'MSP_Per_Quintal_INR',
    'Market_Price_Per_Quintal_INR'
  ];

  const rows = data.map(item => [
    item.year,
    `"${getDistrictName(item.districtId)}"`,
    `"${item.crop}"`,
    `"${item.season}"`,
    item.areaCultivatedAcres,
    item.totalProductionTonnes,
    item.yieldQuintalPerAcre,
    item.monsoonRainfallMm,
    item.annualRainfallMm,
    item.rainfallDeviationPct,
    item.avgTempMaxC,
    item.avgTempMinC,
    item.drySpellDays,
    item.heatwaveDays,
    item.groundwaterDepthMeters,
    `"${item.pestSeverityIndex}"`,
    item.mspPerQuintalInr,
    item.marketPricePerQuintalInr
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Telangana_Agriculture_Climate_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAuditLogToJSON(data: unknown, filename = 'Telangana_Agro_Audit_Trail.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
