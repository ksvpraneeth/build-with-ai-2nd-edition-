import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { NATIONAL_FOOD_BUFFERS, REGIONAL_AGRO_REGISTRY, INITIAL_PROCUREMENT_REQUESTS } from './src/data/procurementData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory / durable file fallback for long-term cloud climate storage
const STORAGE_FILE = path.join(process.cwd(), 'cloud_climate_store.json');

interface CloudStorageData {
  records: any[];
  telemetryLogs: any[];
  procurementRequests: any[];
  smsLogs: any[];
  nationalBuffers: any[];
}

function loadCloudStorage(): CloudStorageData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        records: parsed.records || [],
        telemetryLogs: parsed.telemetryLogs || [],
        procurementRequests: parsed.procurementRequests?.length ? parsed.procurementRequests : INITIAL_PROCUREMENT_REQUESTS,
        smsLogs: parsed.smsLogs || [],
        nationalBuffers: parsed.nationalBuffers?.length ? parsed.nationalBuffers : NATIONAL_FOOD_BUFFERS,
      };
    }
  } catch (err) {
    console.warn('Failed to read cloud storage file, using fallback in-memory store:', err);
  }
  return {
    records: [
      {
        id: 'rec-seed-01',
        timestamp: Date.now() - 86400000 * 2,
        farmerName: 'Mallaiah Goud',
        village: 'Geesukonda, Warangal Rural',
        districtId: 'warangal',
        crop: 'paddy',
        farmSizeAcres: 4.5,
        soilType: 'clay_loam',
        irrigationType: 'kaleshwaram_canal',
        recordedRainfallMm: 45,
        actualYieldQuintalPerAcre: 27.5,
        notes: 'Planted Telangana Sona (RNR 15048). Timely water release from SRSP canal, zero blast incidence.',
        status: 'synced',
        syncTimestamp: Date.now() - 86400000 * 2,
      },
      {
        id: 'rec-seed-02',
        timestamp: Date.now() - 86400000 * 5,
        farmerName: 'Kavitha Devi',
        village: 'Gangadhara, Karimnagar',
        districtId: 'karimnagar',
        crop: 'cotton',
        farmSizeAcres: 3.0,
        soilType: 'black_cotton',
        irrigationType: 'borewell',
        recordedRainfallMm: 38,
        actualYieldQuintalPerAcre: 9.8,
        notes: 'Used yellow sticky traps early; pink bollworm contained below economic threshold.',
        status: 'synced',
        syncTimestamp: Date.now() - 86400000 * 5,
      },
      {
        id: 'rec-seed-03',
        timestamp: Date.now() - 86400000 * 7,
        farmerName: 'Srinivas Rao',
        village: 'Kallur, Khammam',
        districtId: 'khammam',
        crop: 'chilli',
        farmSizeAcres: 2.5,
        soilType: 'red_chalka',
        irrigationType: 'drip_sprinkler',
        recordedRainfallMm: 52,
        actualYieldQuintalPerAcre: 21.0,
        notes: 'Teja variety with drip fertigation. Controlled black thrips with neem + spinetoram.',
        status: 'synced',
        syncTimestamp: Date.now() - 86400000 * 7,
      },
    ],
    telemetryLogs: [],
    procurementRequests: INITIAL_PROCUREMENT_REQUESTS,
    smsLogs: [
      {
        id: 'sms-init-01',
        timestamp: Date.now() - 1000 * 60 * 18,
        direction: 'inbound',
        fromNumber: '+91-94401-82910',
        toNumber: '+91-800-KISAN',
        body: '501141 Kandulu',
        characterCount: 14,
        language: 'te',
        pincode: '501141',
        parsedCrop: 'red_gram',
        status: 'delivered',
        messageSid: 'SM_INIT_001',
      },
      {
        id: 'sms-init-02',
        timestamp: Date.now() - 1000 * 60 * 18 + 1200,
        direction: 'outbound',
        fromNumber: '+91-800-KISAN',
        toNumber: '+91-94401-82910',
        body: 'TS-GOVT: 501141 Kandulu APPROVED. Viability:96%. Buffer Deficit:55%. MSP:Rs7550+Rs650 bonus. Pre-booking Token: TS-TANDUR-MSP-8910. Seed:PRG-176.',
        characterCount: 146,
        language: 'te',
        status: 'delivered',
        messageSid: 'SM_INIT_002',
      },
    ],
    nationalBuffers: NATIONAL_FOOD_BUFFERS,
  };
}

function saveCloudStorage(data: CloudStorageData) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write cloud storage file:', err);
  }
}

let cloudStore = loadCloudStorage();

// Helper to parse incoming SMS text into Pincode & Crop
function parseSmsIntent(text: string) {
  const clean = (text || '').trim();
  const pincodeMatch = clean.match(/\b([1-9][0-9]{5})\b/);
  const pincode = pincodeMatch ? pincodeMatch[1] : '506001';

  const lower = clean.toLowerCase();
  let crop = 'red_gram';
  if (lower.includes('paddy') || lower.includes('rice') || lower.includes('vari') || lower.includes('వరి') || lower.includes('dhaan') || lower.includes('chawal')) {
    crop = 'paddy';
  } else if (lower.includes('cotton') || lower.includes('patti') || lower.includes('పత్తి') || lower.includes('kapas')) {
    crop = 'cotton';
  } else if (lower.includes('redgram') || lower.includes('red_gram') || lower.includes('kandulu') || lower.includes('కందులు') || lower.includes('tur') || lower.includes('toor') || lower.includes('arhar')) {
    crop = 'red_gram';
  } else if (lower.includes('chilli') || lower.includes('mirchi') || lower.includes('మిర్చి') || lower.includes('chili')) {
    crop = 'chilli';
  } else if (lower.includes('maize') || lower.includes('makka') || lower.includes('మక్క') || lower.includes('corn')) {
    crop = 'maize';
  } else if (lower.includes('soybean') || lower.includes('soya') || lower.includes('సోయా')) {
    crop = 'soybean';
  } else if (lower.includes('groundnut') || lower.includes('peanut') || lower.includes('palli') || lower.includes('పల్లి') || lower.includes('verusenaga')) {
    crop = 'groundnut';
  } else if (lower.includes('millet') || lower.includes('jowar') || lower.includes('ragi') || lower.includes('bajra') || lower.includes('jonnalu') || lower.includes('జొన్న')) {
    crop = 'millets';
  }

  return { pincode, crop };
}

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Could not initialize GoogleGenAI client:', e);
    }
  }
  return geminiClient;
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    state: 'Telangana Agriculture & Climate AI Operational',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    cloudRecordsCount: cloudStore.records.length,
    timestamp: new Date().toISOString(),
  });
});

// Cloud Records: List
app.get('/api/cloud-records', (req, res) => {
  res.json({
    success: true,
    count: cloudStore.records.length,
    records: cloudStore.records,
  });
});

// Cloud Records: Add single
app.post('/api/cloud-records', (req, res) => {
  const record = req.body;
  if (!record || !record.farmerName) {
    return res.status(400).json({ error: 'Farmer name is required' });
  }

  const cloudRecord = {
    ...record,
    id: record.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'synced',
    syncTimestamp: Date.now(),
  };

  // Upsert
  const existingIdx = cloudStore.records.findIndex((r) => r.id === cloudRecord.id);
  if (existingIdx >= 0) {
    cloudStore.records[existingIdx] = cloudRecord;
  } else {
    cloudStore.records.unshift(cloudRecord);
  }
  saveCloudStorage(cloudStore);

  res.json({ success: true, record: cloudRecord });
});

// Cloud Records: Batch Sync from rural offline queue
app.post('/api/sync', (req, res) => {
  const { batch } = req.body;
  if (!Array.isArray(batch)) {
    return res.status(400).json({ error: 'Batch array required' });
  }

  const syncedRecords = batch.map((item) => ({
    ...item,
    status: 'synced',
    syncTimestamp: Date.now(),
  }));

  syncedRecords.forEach((newRec) => {
    const existingIdx = cloudStore.records.findIndex((r) => r.id === newRec.id);
    if (existingIdx >= 0) {
      cloudStore.records[existingIdx] = newRec;
    } else {
      cloudStore.records.unshift(newRec);
    }
  });

  saveCloudStorage(cloudStore);

  res.json({
    success: true,
    syncedCount: syncedRecords.length,
    syncedRecords,
    message: `Successfully synchronized ${syncedRecords.length} records into Telangana Cloud Storage.`,
  });
});

// AI Model: Yield Prediction & Predictive Climate Forecasting
app.post('/api/ai/predict-yield', async (req, res) => {
  try {
    const {
      districtId,
      districtName,
      crop,
      season,
      farmSizeAcres,
      soilType,
      irrigationType,
      scenario,
      historicalBaselineYield,
    } = req.body;

    const ai = getGeminiClient();

    // Contextual agronomy rulebook for Telangana baseline
    const baseYield = Number(historicalBaselineYield) || 20;
    const rainfallAnomaly = Number(scenario?.rainfallAnomalyPct) || 0;
    const tempAnomaly = Number(scenario?.tempAnomalyC) || 0;

    if (ai) {
      const prompt = `You are the lead Agricultural Scientist and Climate Forecaster for Professor Jayashankar Telangana State Agricultural University (PJTSAU) and the Agriculture & Farmers Welfare Department of Telangana, India.

Task:
Perform agricultural yield analysis and predictive climate forecasting for the following farm parameter in Telangana state:
- District: ${districtName || districtId} (Telangana State)
- Target Crop: ${crop}
- Farming Season: ${season}
- Farm Size: ${farmSizeAcres} acres
- Soil Classification: ${soilType}
- Irrigation Infrastructure: ${irrigationType}
- 5-Year Historical Average District Yield: ${baseYield} quintals/acre
- Simulated Climate Scenario: Rainfall anomaly ${rainfallAnomaly > 0 ? '+' : ''}${rainfallAnomaly}%, Temperature deviation +${tempAnomaly}°C.

Incorporate historical insights from Telangana's 2020-2025 seasons:
1. Impact of irrigation from Kaleshwaram Lift Irrigation Project & Mission Kakatiya tanks.
2. Sensitivity to dry spells in Southern Telangana (Mahbubnagar, Nalgonda) vs heavier monsoon in Northern/Central belts (Warangal, Adilabad, Khammam).
3. Primary crop vulnerabilities (e.g., Pink bollworm in Cotton, Blast in Paddy, Black Thrips in Chilli, Pod Borer in Red Gram).
4. Specific high-yielding varieties bred for Telangana (e.g. Telangana Sona RNR 15048, BPT 5204, LCA 334, PRG 176, Kadiri 6).

Return ONLY a strict JSON object with NO markdown backticks or wrappers, formatted exactly like:
{
  "predictedYieldQuintalsPerAcre": <number with 1 decimal>,
  "historicalAvgYield": ${baseYield},
  "changePercentage": <number with 1 decimal, e.g. +8.5 or -12.4>,
  "confidenceScore": <number between 82 and 97>,
  "climateOutlook": {
    "monsoonOnset": "<string e.g. Normal onset expected during 2nd week of June with 3 active pulses>",
    "rainfallForecastMm": <number representing seasonal rainfall in mm>,
    "droughtRisk": "<'Low' | 'Moderate' | 'High' | 'Severe'>",
    "drySpellRisk": "<string describing dry spell periods>",
    "temperatureTrend": "<string describing temperature range and heat risk>"
  },
  "recommendedPractices": {
    "sowingWindow": "<exact dates/weeks for Telangana>",
    "seedVarieties": ["<variety 1>", "<variety 2>", "<variety 3>"],
    "fertilizerSchedule": [
      { "stage": "Basal / Land Preparation", "fertilizer": "DAP / Potash", "dosage": "e.g. 50 kg DAP + 25 kg MOP per acre" },
      { "stage": "Tillering / Active Vegetative", "fertilizer": "Urea + Zinc", "dosage": "e.g. 25 kg Urea split dose" },
      { "stage": "Panicle / Flowering", "fertilizer": "MOP / Micronutrients", "dosage": "e.g. 15 kg Potash spray" }
    ],
    "irrigationSchedule": "<specific watering interval and conservation tip>",
    "pestWarnings": [
      {
        "pest": "<pest name>",
        "risk": "<Low | Moderate | High>",
        "organicRemedy": "<e.g. Neem oil 10,000 ppm @ 2ml/L + Pheromone traps>",
        "chemicalRemedy": "<chemical recommendation with dosage>"
      }
    ],
    "harvestWindow": "<projected harvest timeline>"
  },
  "economicForecast": {
    "estimatedRevenuePerAcre": <number in INR>,
    "projectedInputCostPerAcre": <number in INR>,
    "expectedNetProfitPerAcre": <number in INR>
  },
  "reasoningNotes": "<concise scientific summary of the yield forecast and climate risk matrix>"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText.trim());
        return res.json({ success: true, source: 'gemini-3.8-flash', prediction: parsed });
      } catch (parseErr) {
        console.warn('Failed to parse Gemini JSON response, using deterministic agro-engine:', parseErr);
      }
    }

    // Deterministic Telangana Agro-Climate Model fallback
    const rainfallImpact = (rainfallAnomaly / 100) * 0.45;
    const tempImpact = -(tempAnomaly * 0.04);
    const irrigationBonus = irrigationType === 'kaleshwaram_canal' || irrigationType === 'drip_sprinkler' ? 0.12 : irrigationType === 'rainfed' ? -0.15 : 0.05;
    const netMultiplier = 1 + rainfallImpact + tempImpact + irrigationBonus;
    const calculatedYield = Math.max(2, parseFloat((baseYield * netMultiplier).toFixed(1)));
    const pctChange = parseFloat((((calculatedYield - baseYield) / baseYield) * 100).toFixed(1));

    const fallbackResult = {
      predictedYieldQuintalsPerAcre: calculatedYield,
      historicalAvgYield: baseYield,
      changePercentage: pctChange,
      confidenceScore: 89,
      climateOutlook: {
        monsoonOnset: 'Southwest monsoon onset scheduled around June 8-12 over Telangana with robust initial rains.',
        rainfallForecastMm: Math.round(920 * (1 + rainfallAnomaly / 100)),
        droughtRisk: rainfallAnomaly < -15 ? 'High' : rainfallAnomaly < 0 ? 'Moderate' : 'Low',
        drySpellRisk: rainfallAnomaly < -10 ? 'Potential 12-16 day dry spell mid-August during flowering.' : 'Intermittent showers every 5-7 days; low dry spell stress.',
        temperatureTrend: `Mean maximum temperatures around ${32 + tempAnomaly}°C, favorable for crop canopy development.`,
      },
      recommendedPractices: {
        sowingWindow: season === 'kharif_vanakalam' ? 'June 15 - July 10 (immediately following 50mm soaking rain)' : 'October 15 - November 15',
        seedVarieties: [
          crop === 'paddy' ? 'Telangana Sona (RNR 15048)' : crop === 'cotton' ? 'Bollgard-II Hybrid' : 'PRG 176 (Ujwala)',
          crop === 'paddy' ? 'BPT 5204 (Samba Mahsuri)' : crop === 'chilli' ? 'Teja (Warangal Local)' : 'DHM 117 (Maize)',
          'PJTSAU Resilient Cultivar'
        ],
        fertilizerSchedule: [
          { stage: 'Basal Soil Application', fertilizer: 'DAP + Potash + Zinc Sulphate', dosage: '50 kg DAP + 20 kg MOP + 10 kg ZnSO4 per acre' },
          { stage: 'Tillering / Branching (30-35 DAS)', fertilizer: 'Neem-coated Urea', dosage: '25 kg Urea applied after weeding' },
          { stage: 'Panicle / Flowering Stage', fertilizer: 'Potassium Nitrate (13-0-45)', dosage: 'Foliar spray @ 10g/liter water' },
        ],
        irrigationSchedule: irrigationType === 'rainfed'
          ? 'Rely on moisture conservation through dust mulching; provide 1 lifesaving irrigation via Rythu Cheruvu/farm pond if dry spell exceeds 10 days.'
          : 'Maintain alternate wetting and drying (AWD) to economize water and prevent sheath rot.',
        pestWarnings: [
          {
            pest: crop === 'cotton' ? 'Pink Bollworm' : crop === 'chilli' ? 'Black Thrips' : 'Stem Borer & Blast',
            risk: 'Moderate',
            organicRemedy: 'Neem seed kernel extract (NSKE 5%) + 8 Pheromone traps/acre',
            chemicalRemedy: 'Flubendiamide 39.35% SC @ 0.2ml/L or Chlorantraniliprole 18.5% SC @ 0.3ml/L',
          },
        ],
        harvestWindow: season === 'kharif_vanakalam' ? 'Late October to Mid November' : 'February to March',
      },
      economicForecast: {
        estimatedRevenuePerAcre: Math.round(calculatedYield * 2400),
        projectedInputCostPerAcre: 18500,
        expectedNetProfitPerAcre: Math.round(calculatedYield * 2400 - 18500),
      },
      reasoningNotes: `Prediction synthesized using 5-year Telangana climate metrics across ${districtName || districtId} district. The expected yield of ${calculatedYield} Qtl/acre reflects ${soilType} soil dynamics and ${irrigationType} water security.`,
    };

    return res.json({ success: true, source: 'telangana-agro-engine', prediction: fallbackResult });
  } catch (err: any) {
    console.error('Error in predict-yield endpoint:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate prediction' });
  }
});

// ================= RYTHU MITRA / KISAN AI ASSISTANT =================
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { 
      message, 
      conversationHistory = [], 
      language = 'te', 
      pincode = '501141', 
      crop = 'red_gram',
      districtId = 'warangal'
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    const ai = getGeminiClient();
    const profile = REGIONAL_AGRO_REGISTRY[pincode] || REGIONAL_AGRO_REGISTRY['501141'];

    // If Gemini client is available, call gemini-3.8-flash
    if (ai) {
      const historyFormatted = Array.isArray(conversationHistory)
        ? conversationHistory
            .slice(-6)
            .map((m: any) => `${m.role === 'user' ? 'User' : 'Rythu Mitra AI'}: ${m.content}`)
            .join('\n')
        : '';

      const langMap: Record<string, string> = {
        te: 'Telugu (తెలుగు)',
        en: 'English',
        hi: 'Hindi (हिंदी)',
        ur: 'Urdu (اردو)',
      };
      const targetLangName = langMap[language] || 'Telugu';

      const systemPrompt = `You are "Rythu Mitra" (రైతు మిత్ర / किसान मित्र), the expert Agricultural, Climate, and MSP Procurement AI Assistant for Telangana and Andhra Pradesh farmers, Agricultural Extension Officers (AEOs), and District Agricultural Officers (DAOs).

Knowledge Grounding:
- Agricultural University: Professor Jayashankar Telangana State Agricultural University (PJTSAU).
- Climate History (2020-2025): 5-year monsoon anomalies, Kaleshwaram Lift Irrigation canal releases, Mission Kakatiya tanks, Southern semi-arid dry spells vs Northern heavy monsoon belts.
- 2025-26 Central MSP & Procurement Buffer Status:
  * Pulses (Tur/Red Gram): ₹7,550/Qtl Base MSP + ₹650/Qtl National Deficit Procurement Bonus = ₹8,200/Qtl. National FCI buffer is in CRITICAL DEFICIT (-55.6%). Priority procurement.
  * Common Paddy: ₹2,300/Qtl (Grade A ₹2,320/Qtl). National buffer is in EXTREME SURPLUS (+108.5%). Diversification to pulses/oilseeds actively incentivized.
  * Cotton (Medium/Long): ₹7,121 - ₹7,521/Qtl. Pink bollworm management & timely picking crucial.
  * Chilli: ₹19,500/Qtl market benchmark (Guntur / Warangal).
  * Millets (Jowar/Ragi/Bajra): ₹3,371 - ₹4,290/Qtl. Buffer deficit -54.0%.
  * Soybean: ₹4,892/Qtl. Oilseed buffer deficit -33.0%.
- Heritage & Geographical Indication (GI) Tags:
  * Tandur Red Gram (Vikarabad - 501141)
  * Warangal Chapata Chilli (506001)
  * Guntur Sannam Chilli (522001)
  * Telangana Sona (RNR 15048) low glycemic index rice
- Current Context: Pincode ${pincode} (${profile.districtName}, Soil: ${profile.soilClassification}, 5-yr rainfall: ${profile.fiveYearAvgRainfallMm} mm, Soil pH: ${profile.soilPh}). Target crop: ${crop}.

Tone & Style:
- Warm, respectful, scientific, yet completely practical for farmers.
- Always answer in ${targetLangName}.
- Provide actionable agronomic tips: specific seed varieties (e.g., PRG-176, Telangana Sona RNR 15048, LCA 334), precise organic remedies (Neem NSKE 5%, pheromone traps, yellow sticky cards), and chemical sprays only when pest threshold is exceeded with exact dosage per acre.
- Also produce a strict 160-character GSM-7 SMS advisory version suitable for sending over cellular SMS to a farmer with a 2G keypad phone.

Respond strictly with a JSON object in this format (no markdown code blocks, just raw JSON):
{
  "reply": "<detailed conversational response in ${targetLangName}>",
  "smsSummary160": "<exact 160 character or fewer SMS advisory in ${targetLangName} with key advice, numbers, and action>",
  "suggestedQuestions": ["<follow up question 1 in ${targetLangName}>", "<follow up question 2>", "<follow up question 3>"],
  "keyTopics": ["<topic 1>", "<topic 2>"],
  "category": "advisory"
}`;

      const userPrompt = `Conversation History:\n${historyFormatted}\n\nCurrent User Query: "${message}"\nLanguage: ${targetLangName}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text.trim());
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          reply: parsed.reply,
          smsSummary160: (parsed.smsSummary160 || '').substring(0, 160),
          suggestedQuestions: parsed.suggestedQuestions || [],
          keyTopics: parsed.keyTopics || ['Agronomy', 'Climate'],
          category: parsed.category || 'advisory',
          timestamp: Date.now(),
        });
      } catch (geminiErr) {
        console.warn('Gemini assistant call failed, using agronomic knowledge engine fallback:', geminiErr);
      }
    }

    // Fallback Knowledge Engine (Intelligent Agronomic Expert System)
    const lower = message.toLowerCase();
    let reply = '';
    let smsSummary160 = '';
    let suggestedQuestions = [
      language === 'te' ? 'కందుల సాగుకు ఉత్తమ విత్తన రకాలు ఏవి?' : 'What are the best seed varieties for Red Gram?',
      language === 'te' ? '2026 లో పత్తి కనీస మద్దతు ధర ఎంత?' : 'What is the 2026 MSP for Cotton?',
      language === 'te' ? 'వరికి బదులుగా కందులు వేస్తే ఎంత బోనస్ వస్తుంది?' : 'What is the bonus for switching from Paddy to Pulses?',
    ];
    let keyTopics = ['Agronomy', 'Advisory'];

    if (lower.includes('pink bollworm') || lower.includes('గులాబీ రంగు పురుగు') || lower.includes('bollworm') || lower.includes('patti') || lower.includes('cotton')) {
      keyTopics = ['Cotton', 'Pest Control', 'Pink Bollworm'];
      if (language === 'te') {
        reply = `**పత్తిలో గులాబీ రంగు పురుగు (Pink Bollworm) యాజమాన్యం:**\n\n1. **సేంద్రీయ నియంత్రణ:** ఎకరానికి 8 లింగాకర్షక బుట్టలు (Pheromone Traps) అమర్చండి. పూత దశ నుంచి 5% వేప గింజల కషాయం (NSKE) లేదా 1500 ppm వేప నూనె 2.5 మి.లీ లీటరు నీటికి కలిపి పిచికారీ చేయండి.\n2. **రసాయన నియంత్రణ:** పురుగు తీవ్రత పెరిగితే, ప్రొఫెనోఫాస్ 50% EC 2 మి.లీ లేదా క్లోరాంట్రానిలిప్రోల్ 18.5% SC 0.3 మి.లీ లీటరు నీటికి కలిపి పిచికారీ చేయండి.\n3. **ముఖ్య సూచన:** పత్తి తీత పూర్తయిన వెంటనే పశువులను మేపి, మోళ్ళను సమూలంగా పీకి కాల్చివేయడం ద్వారా వచ్చే పంటకు పురుగు వ్యాప్తిని అరికట్టవచ్చు.`;
        smsSummary160 = 'పత్తి గులాబీ పురుగు నివారణ: ఎకరాకు 8 లింగాకర్షక బుట్టలు, 5% వేప గింజల కషాయం లేదా ప్రొఫెనోఫాస్ 2మి.లీ/లీ. నీటికి పిచికారీ చేయండి. -రైతు మిత్ర';
      } else {
        reply = `**Pink Bollworm Management in Cotton:**\n\n1. **Monitoring & Traps:** Install 8 pheromone traps per acre at 45 days after sowing to track adult moth flight.\n2. **Organic/Botanical Spray:** Spray Neem Seed Kernel Extract (NSKE 5%) or Azadirachtin 1500 ppm @ 2.5 ml/litre of water at square initiation.\n3. **Targeted Chemical Spray:** If ETL (8 moths/trap/day for 3 days or 10% damaged bolls) is breached, apply Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Profenofos 50% EC @ 2 ml/L.\n4. **Post-Harvest:** Do not allow ratoon cotton; graze cattle and shred stalks to break pupal hibernation.`;
        smsSummary160 = 'TS-AGRI: Cotton Pink Bollworm control: Install 8 pheromone traps/acre. Spray NSKE 5% or Profenofos 2ml/L. Destroy crop residue post-harvest. -Rythu Mitra';
      }
    } else if (lower.includes('scenario') || lower.includes('senario') || lower.includes('recommendation') || lower.includes('సిఫార్సు') || lower.includes('దృశ్య') || lower.includes('water stress') || lower.includes('salinity')) {
      keyTopics = ['Scenario Recommendations', 'Field Prescriptions', 'Agro-Ecology'];
      if (language === 'te') {
        reply = `**పీజేటీఎస్ఏయూ క్షేత్ర దృశ్యాల సిఫార్సులు (Field Scenario Recommendations):**\n\n1. **సన్నివేశం 1: తాండూరు కందులు (501141 - GI-729)**: జాతీయ పప్పుధాన్యాల కొరత (-55.6%) భర్తీకి కందులు PRG-176 సాగు చేయండి. బేస్ MSP ₹7,550 + ₹650 బోనస్ = **₹8,200/క్విం**. ఎకరానికి 13.5 లక్షల లీటర్ల నీరు ఆదా అవుతుంది.\n2. **సన్నివేశం 2: మహబూబ్‌నగర్ తీవ్ర నీటి ఎద్దడి (509001)**: బోర్లు ఎండిపోకుండా వరికి బదులుగా జొన్నలు (CSH-16) లేదా కొర్రలు వేయండి. బోనస్ MSP **₹4,270/క్విం**. ఎకరాకు 18.5 లక్షల లీటర్ల నీరు ఆదా!\n3. **సన్నివేశం 3: వరంగల్ పత్తి గులాబీ పురుగు (506001)**: ఎకరాకు 8 లింగాకర్షక బుట్టలు, వేప నూనెతో రసాయన ఖర్చు రూ.8,500 ఆదా.\n4. **సన్నివేశం 4: కరీంనగర్ ఎస్సారెస్పీ ఆయకట్టు చౌడు నేలలు (505001)**: వరి మిగులు (+108.5%) ఉన్నందున సోయాబీన్ (MSP ₹5,192) లేదా షుగర్-లెస్ తెలంగాణ సోనా (RNR 15048) వేయండి.\n5. **సన్నివేశం 5: గుంటూరు మిర్చి నల్ల తామర (522001 - GI-49)**: 30 నీలి జిగురు అట్టలు, సరిహద్దు జొన్న కంచెతో ఎగుమతి నాణ్యత కాపాడండి.`;
        smsSummary160 = 'క్షేత్ర దృశ్యాల సలహా: నీటి ఎద్దడిలో జొన్నలు, తాండూరులో కందులు (రూ.8200/క్విం), వరి మిగులు ప్రాంతాల్లో సోయాబీన్ వేసి భూగర్భ జలాలను కాపాడండి. -కిసాన్ సేతు';
      } else {
        reply = `**PJTSAU Field Scenario Recommendations Matrix:**\n\n1. **Scenario 1: Tandur Red Gram (501141 - GI-729)**: Bridge national pulse deficit (-55.6%). Plant PRG-176 or Asha. Base MSP ₹7,550 + ₹650 bonus = **₹8,200/Qtl**. Saves 1,350,000 L water/acre.\n2. **Scenario 2: Mahbubnagar Severe Water Stress (509001)**: Prevent borewell dryout by switching from summer paddy to Nutri-Cereal Millets (Jowar CSH-16 / Foxtail). Guaranteed payout **₹4,270/Qtl**. Saves 1,850,000 L water/acre.\n3. **Scenario 3: Warangal Cotton Pest Crisis (506001)**: IPM with 8 pheromone traps and botanical neem sprays to curb pink bollworm; saves ₹8,500/acre in toxic pesticides.\n4. **Scenario 4: Karimnagar Canal Command Salinity (505001)**: Overcome extreme paddy surplus (+108.5%) by shifting to Yellow Soybean (₹5,192/Qtl) or low-GI Telangana Sona (RNR 15048).\n5. **Scenario 5: Guntur Chilli Black Thrips (522001 - GI-49)**: 30 blue sticky traps/acre + sorghum border barrier to protect export quality and secure ₹15,000 - ₹20,000/Qtl.`;
        smsSummary160 = 'PJTSAU SCENARIOS: Tandur Red Gram (Rs8200/Qtl), Mahbubnagar Millets for water stress, Karimnagar Soybean to beat paddy surplus. View Scenarios tab in app!';
      }
    } else if (lower.includes('heritage') || lower.includes('gi tag') || lower.includes('వారసత్వ') || lower.includes('gi-') || lower.includes('tandur') || lower.includes('తాండూరు') || lower.includes('chapata') || lower.includes('sannam') || lower.includes('telangana sona')) {
      keyTopics = ['Crop Heritage Protection', 'GI Tags', 'Genetic Biodiversity'];
      if (language === 'te') {
        reply = `**రైతు వారసత్వ పంటల రక్షణ & GI గుర్తింపు వ్యవస్థ:**\n\nతెలంగాణ మరియు ఆంధ్రప్రదేశ్ యొక్క స్థానిక దేశవాళీ విత్తనాలు మరియు GI గుర్తింపు పొందిన పంటల పరిరక్షణ అత్యంత కీలకం:\n\n1. **తాండూరు కందులు (GI-729 - వికారాబాద్)**: 24% అత్యధిక ప్రోటీన్, సున్నపు నల్లరేగడి నేలల ప్రత్యేకత. కల్తీ లేని స్థానిక రకాల సాగుకు క్వింటాలుకు **₹650 అదనపు సంరక్షణ బోనస్** లభిస్తుంది.\n2. **వరంగల్ చపటా మిర్చి (GI-612)**: ముదురు ఎరుపు సహజ రంగు (ASTA >160), తక్కువ కారం. పత్తి పురుగు మందుల ప్రభావం పడకుండా జీవకంచె అవసరం (+₹500/క్విం బోనస్).\n3. **గుంటూరు సన్నం మిర్చి (GI-49)**: ప్రపంచ ప్రసిద్ధి చెందిన ఘాటు (0.25% కాప్సైసిన్). రసాయన అవశేషాలు లేకుండా పండించి ఎగుమతి ప్రీమియం పొందండి (+₹500/క్విం బోనస్).\n4. **తెలంగాణ సోనా (RNR 15048)**: తక్కువ గ్లైసెమిక్ ఇండెక్స్ (51.5) కలిగిన పరిశోధనా వరి. 25% తక్కువ నీటితో పండుతుంది (+₹200/క్విం బోనస్).\n5. **ఆర్మూర్ పసుపు (నిజామాబాద్)**: 5.5% అధిక కర్కుమిన్ కలిగిన ఔషధ రకం.\n\n⚠️ **జీవవైవిధ్య హెచ్చరిక**: అనుమతి లేని విదేశీ హైబ్రిడ్ విత్తనాలతో స్థానిక విత్తన నిధులను కలుషితం చేయవద్దు.`;
        smsSummary160 = 'వారసత్వ పంటల రక్షణ: తాండూరు కందులు (GI-729), వరంగల్ చపటా (GI-612), గుంటూరు సన్నం (GI-49). స్వచ్ఛమైన దేశవాళీ విత్తనాలు వాడి బోనస్ పొందండి. -కిసాన్ సేతు';
      } else {
        reply = `**Crop Heritage & Geographical Indication (GI) Protection Matrix:**\n\nPreserving indigenous heirloom genetics and defending agro-biodiversity under the Biological Diversity Act 2002:\n\n1. **Tandur Red Gram (GI Registration No. 729)**: Renowned for 24% high protein and unique attapulgite clay soil geology. Verified heirloom growers receive a **₹650/Qtl National Deficit Conservation Bonus** (Total ₹8,200/Qtl).\n2. **Warangal Chapata Chilli (GI Registration No. 612)**: Deep crimson color (ASTA >160), mild heat, high oleoresin. Guard against pesticide drift with sorghum borders (+₹500/Qtl bonus).\n3. **Guntur Sannam Chilli (GI Registration No. 49)**: Global benchmark for capsaicin pungency (0.25%). Must follow IPM to satisfy EU/US MRL residue thresholds (+₹500/Qtl bonus).\n4. **Telangana Sona Rice (RNR 15048)**: Clinically verified low Glycemic Index (51.5) and 25% water conservation breed developed by PJTSAU (+₹200/Qtl bonus).\n5. **Armoor Heritage Turmeric (Nizamabad)**: 5.5% medicinal curcumin concentration.\n\n⚠️ **Genetic Integrity Guardrail**: Cultivating non-certified commercial hybrids in designated GI basins forfeits GI procurement certification and accelerates heirloom genetic extinction.`;
        smsSummary160 = 'HERITAGE CROP DEFENSE: Tandur Red Gram (GI-729), Warangal Chapata (GI-612), Guntur Sannam (GI-49). Avail +Rs500-650/Qtl conservation bonus. Guard native seeds!';
      }
    } else if (lower.includes('msp') || lower.includes('మద్దతు ధర') || lower.includes('bonus') || lower.includes('token') || lower.includes('procurement')) {
      keyTopics = ['MSP Rates', 'National Deficit Bonus', 'FCI Procurement'];
      if (language === 'te') {
        reply = `**2025-26 కనీస మద్దతు ధర (MSP) మరియు కొనుగోలు వివరాలు:**\n\n- **కందులు (Red Gram):** బేస్ MSP ₹7,550 + జాతీయ ఆహార నిల్వల కొరత బోనస్ ₹650 = **₹8,200/క్వింటాళ్**.\n- **పత్తి (Cotton):** ₹7,121 - ₹7,521/క్వింటాళ్ (ఫైబర్ పొడవును బట్టి).\n- **వరి (Paddy Common):** ₹2,300/క్వింటాళ్ (గ్రేడ్-ఏ: ₹2,320).\n- **జొన్నలు (Jowar):** ₹3,371/క్వింటాళ్.\n\n💡 **ప్రీ-బుకింగ్ టోకెన్:** పప్పుధాన్యాలు & నూనెగింజలు సాగు చేసే రైతులకు FCI కొనుగోలు గ్యారెంటీ ప్రీ-బుకింగ్ టోకెన్ లభిస్తుంది. మీరు పోర్టల్ లేదా 501141 Kandulu అని SMS చేసి రిజిస్టర్ చేసుకోవచ్చు.`;
        smsSummary160 = '2026 MSP: కందులు రూ.7550+రూ.650 బోనస్=రూ.8200/క్విం. పత్తి రూ.7521. వరి రూ.2300. పప్పుధాన్యాల కొనుగోలుకు FCI ప్రాధాన్యత. టోకెన్ తీసుకోండి. -రైతు మిత్ర';
      } else {
        reply = `**2025-26 MSP Rates & National Buffer Incentive Structure:**\n\n- **Red Gram / Tur:** Base MSP ₹7,550 + Central Deficit Incentive ₹650 = **₹8,200/Quintal** (National buffer is at -55.6% deficit, making procurement guaranteed).\n- **Cotton:** ₹7,121 (Medium Staple) to ₹7,521 (Long Staple) per quintal.\n- **Common Paddy:** ₹2,300/Qtl (Grade A: ₹2,320/Qtl). Current FCI buffers are at +108.5% surplus.\n- **Millets (Jowar):** ₹3,371/Qtl.\n\nFarmers growing deficit-bridging pulses and oilseeds can receive instant pre-booking tokens ensuring zero distress sales.`;
        smsSummary160 = 'TS-GOVT MSP: Red Gram Rs7550 + Rs650 bonus = Rs8200/Qtl. Cotton Rs7521/Qtl. Common Paddy Rs2300/Qtl. Pre-book pulse token for guaranteed FCI purchase.';
      }
    } else {
      keyTopics = ['General Advisory', 'PJTSAU Recommendations'];
      if (language === 'te') {
        reply = `నమస్కారం! నేను మీ **రైతు మిత్ర AI అసిస్టెంట్**.\n\nమీ ప్రాంతం **${profile.districtName} (పిన్‌కోడ్: ${pincode})** నేల స్వభావం: **${profile.soilClassification}**, సగటు వర్షపాతం: **${profile.fiveYearAvgRainfallMm} మి.మీ**, నేల pH: **${profile.soilPh}**.\n\nనేను మీకు కింది విషయాలలో సహాయం చేయగలను:\n1. పంటల ఎంపిక, దిగుబడి అంచనాలు & పీజేటీఎస్ఏయూ సిఫార్సులు\n2. గులాబీ రంగు పురుగు, నల్ల తామర పురుగు, అగ్గితెగులు నివారణ మందులు & మోతాదులు\n3. 2026 కనీస మద్దతు ధర (MSP) మరియు జాతీయ ఆహార కొరత బోనస్ వివరాలు\n4. 2G కీప్యాడ్ ఫోన్ల కోసం 160 అక్షరాల SMS సలహాలు సిద్ధం చేయడం.`;
        smsSummary160 = `రైతు మిత్ర: ${profile.districtName} వాతావరణం, విత్తనాలు, తెగుళ్ల మందులు మరియు MSP కొనుగోలు సలహాల కోసం ప్రశ్న అడగండి. -కిసాన్ సేతు`;
      } else {
        reply = `Hello! I am your **Rythu Mitra AI Assistant**, grounded on PJTSAU agronomy data and 5-year Telangana climate records.\n\nFor your selected location **${profile.districtName} (Pincode: ${pincode})**, the soil is **${profile.soilClassification}** with 5-year average rainfall of **${profile.fiveYearAvgRainfallMm} mm** and soil pH **${profile.soilPh}**.\n\nHow can I assist your farming today?\n- **Pest & Disease Diagnosis:** Organic and chemical remedies for Cotton, Paddy, Chilli, and Pulses.\n- **MSP & Procurement Guarantees:** 2026 MSP rates, Tur bonus (₹8,200/Qtl), and Pre-Booking tokens.\n- **Climate & Sowing Windows:** 5-year monsoon arrival trends and drought-resilient crops.\n- **160-Char SMS Drafter:** Instant cellular advisories formatted for 2G keypad handsets.`;
        smsSummary160 = `Rythu Mitra AI: Farm advice, 2026 MSP prices, pest remedies & weather insights for ${profile.districtName}. Ask any crop question!`;
      }
    }

    if (smsSummary160.length > 160) {
      smsSummary160 = smsSummary160.substring(0, 157) + '...';
    }

    res.json({
      success: true,
      source: 'telangana-agronomy-engine',
      reply,
      smsSummary160,
      suggestedQuestions,
      keyTopics,
      category: 'advisory',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in assistant endpoint:', err);
    res.status(500).json({ error: err?.message || 'Assistant encountered an error' });
  }
});

// ================= KISAN-SETU NATIONAL BUFFER & SMS PIPELINE =================


// 1. National Buffers
app.get('/api/national-buffers', (req, res) => {
  res.json({
    success: true,
    buffers: cloudStore.nationalBuffers || NATIONAL_FOOD_BUFFERS,
    timestamp: new Date().toISOString(),
  });
});

// 2. Regional Profile lookup
app.get('/api/regional-profiles/:pincode', (req, res) => {
  const pincode = req.params.pincode;
  const profile = REGIONAL_AGRO_REGISTRY[pincode] || {
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
  };
  res.json({ success: true, profile });
});

// Helper for AI Brain evaluation (Gemini + fallback)
async function evaluateCropSuitability({
  pincode,
  crop,
  farmAreaAcres = 3,
  language = 'te',
  farmerPhone = '+91-98000-00000',
  farmerName = 'Kisan Mitra',
}: {
  pincode: string;
  crop: string;
  farmAreaAcres?: number;
  language?: string;
  farmerPhone?: string;
  farmerName?: string;
}) {
  const profile = REGIONAL_AGRO_REGISTRY[pincode] || {
    pincode,
    districtId: 'telangana_zone',
    districtName: 'Telangana Agri Zone',
    state: 'Telangana',
    soilClassification: 'Red Chalka & Clay Loam',
    soilPh: 7.1,
    fiveYearAvgRainfallMm: 860,
    fiveYearAvgTempC: 33.2,
    droughtVulnerability: 'Moderate',
    giTagHeritageCrops: ['Telangana Sona Rice'],
    dominantLanguage: 'te',
  };

  const bufferInfo = (cloudStore.nationalBuffers || NATIONAL_FOOD_BUFFERS).find((b: any) => b.cropId === crop) || {
    cropId: crop,
    cropNameEn: crop.toUpperCase(),
    category: 'grain',
    targetBufferMillionTonnes: 3.0,
    currentStockMillionTonnes: 2.5,
    deficitSurplusPct: -16.0,
    status: 'DEFICIT',
    priorityScore: 70,
    mspCurrentInrPerQtl: 5000,
    procurementBonusInrPerQtl: 200,
    recommendedAction: 'Procurement supported based on regional demand.',
  };

  const ai = getGeminiClient();

  if (ai) {
    try {
      const masterPrompt = `You are the AI Brain of KisanSetu / RythuSetu, the National Agricultural Intelligence & Food Security Procurement Engine for India.
You operate under strict ethical guardrails to safeguard regional heritage crops (Geographical Indications / GI tags) and balance ground realities with national food security buffers.

INPUT PARAMETERS:
- Regional Pincode: ${pincode} (${profile.districtName}, ${profile.state})
- Soil Classification: ${profile.soilClassification}, Soil pH: ${profile.soilPh}
- 5-Year Average Rainfall: ${profile.fiveYearAvgRainfallMm} mm | Avg Temp: ${profile.fiveYearAvgTempC}°C | Drought Risk: ${profile.droughtVulnerability}
- Regional GI / Heritage Crops: ${profile.giTagHeritageCrops.join(', ')}
- Heritage Ecology Guidelines: ${profile.heritageEcologyNotes || 'Maintain local crop diversity.'}
- Farmer's Proposed Crop: ${crop} (Requested Area: ${farmAreaAcres} acres)
- National Food Security Buffer Status:
  * Crop: ${bufferInfo.cropNameEn}
  * National Target: ${bufferInfo.targetBufferMillionTonnes}M MT | Actual Stock: ${bufferInfo.currentStockMillionTonnes}M MT
  * Stock Deficit/Surplus: ${bufferInfo.deficitSurplusPct}% (${bufferInfo.status})
  * Central Priority Score: ${bufferInfo.priorityScore}/100 | Base MSP: ₹${bufferInfo.mspCurrentInrPerQtl}/Qtl | Bonus: ₹${bufferInfo.procurementBonusInrPerQtl}/Qtl

GUARDRAILS & RULES:
1. Heritage Crop Guardrail:
   - Check if the proposed crop threatens regional GI tags or historic monocultures (e.g. planting invasive water-intensive flood paddy in Guntur Sannam Chilli GI zone or Warangal Chapata Chilli zone).
   - If a conflict exists, set "heritageGuardrailTriggered": true, give a clear heritage warning, and recommend a non-disruptive crop.
2. National Buffer Cross-Check:
   - If the crop has a high national deficit (e.g. Pulses/Red Gram -55%, Millets -54%, Oilseeds), award high viability and mark eligible for automated MSP pre-booking.
   - If the crop is in extreme national surplus (e.g. Paddy +108%) AND the region has high drought vulnerability or depleted groundwater (e.g. Mahbubnagar, Nalgonda), lower viability score and strongly recommend shifting to pulses/millets.
3. STRICT 160-CHARACTER SMS CONSTRAINT:
   - "smsAdvisory160" MUST NOT EXCEED 160 CHARACTERS!
   - Must be written in ${language === 'te' ? 'Telugu (or simple English-Telugu script)' : language === 'hi' ? 'Hindi' : 'English'}.
   - Include: Crop status, Viability%, MSP rate or bonus, and action token.
   - No markdown backticks, no pleasantries, pure high-density advisory.

Return ONLY a strict JSON object formatted exactly as:
{
  "viabilityScore": <number 0-100>,
  "sustainabilityScore": <number 0-100>,
  "nationalBufferMatch": <boolean>,
  "nationalBufferStatus": "${bufferInfo.status}",
  "heritageGuardrailTriggered": <boolean>,
  "heritageConflictWarning": <string or null>,
  "mspGuaranteeEligible": <boolean>,
  "recommendedAlternative": <string or null>,
  "smsAdvisory160": "<STRICTLY <= 160 chars in requested language>",
  "smsAdvisoryEn": "<English translation <= 160 chars>",
  "detectedLanguage": "${language}",
  "recommendedMspInr": ${bufferInfo.mspCurrentInrPerQtl},
  "procurementIncentiveInr": ${bufferInfo.procurementBonusInrPerQtl},
  "scientificRationale": "<2-sentence agronomic and national buffer rationale>",
  "weatherSoilSummary": {
    "rainfallMm": ${profile.fiveYearAvgRainfallMm},
    "rainfallStatus": "${profile.fiveYearAvgRainfallMm > 900 ? 'Adequate / High' : 'Semi-arid / Moderate'}",
    "soilPh": ${profile.soilPh},
    "soilType": "${profile.soilClassification}",
    "temperatureRange": "${profile.fiveYearAvgTempC}°C mean"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: masterPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse((response.text || '').trim());
      // Ensure strict 160 char safety
      if (parsed.smsAdvisory160 && parsed.smsAdvisory160.length > 160) {
        parsed.smsAdvisory160 = parsed.smsAdvisory160.substring(0, 157) + '...';
      }
      return { success: true, source: 'gemini-3.8-flash', evaluation: parsed };
    } catch (geminiErr) {
      console.warn('Gemini evaluation failed, utilizing deterministic KisanSetu engine:', geminiErr);
    }
  }

  // Deterministic Guardrail & Buffer Cross-Check Engine
  const isPaddyInDryzone = (crop === 'paddy') && (profile.droughtVulnerability === 'Severe' || profile.droughtVulnerability === 'High');
  const isHeritageConflict = (pincode === '522001' && crop === 'paddy') || (pincode === '506001' && crop === 'paddy' && profile.giTagHeritageCrops.some((g: string) => g.includes('Chapata')));
  const isBufferDeficitMatch = bufferInfo.status === 'CRITICAL_DEFICIT' || bufferInfo.status === 'DEFICIT';

  let viability = 85;
  let sustainability = 88;
  let warning: string | null = null;
  let altCrop: string | null = null;

  if (isHeritageConflict) {
    viability = 38;
    sustainability = 32;
    warning = `HERITAGE CONFLICT: Pincode ${pincode} is protected ${profile.giTagHeritageCrops[0]} belt. Flood irrigation degrades heritage chili soil ecology.`;
    altCrop = pincode === '522001' ? 'chilli' : 'red_gram';
  } else if (isPaddyInDryzone) {
    viability = 44;
    sustainability = 30;
    warning = `WATER STRESS & SURPLUS: 5-year rainfall (${profile.fiveYearAvgRainfallMm}mm) is low and national rice reserve is +108% surplus.`;
    altCrop = 'millets';
  } else if (isBufferDeficitMatch) {
    viability = 94;
    sustainability = 92;
  }

  const mspTotal = bufferInfo.mspCurrentInrPerQtl + (isBufferDeficitMatch ? bufferInfo.procurementBonusInrPerQtl : 0);
  let sms160 = '';
  if (language === 'te') {
    if (isHeritageConflict) {
      sms160 = `హెచ్చరిక ${pincode}: జీఐ చిల్లీ నేలల్లో వరి వద్దు! మిరప లేదా కందులు వేయండి. ప్రభుత్వ MSP మద్దతు లభిస్తుంది.`;
    } else if (isPaddyInDryzone) {
      sms160 = `రైతు సలహా ${pincode}: నీటి కొరత & వరి నిల్వలు ఎక్కువ. జొన్నలు/చిరుధాన్యాలు వేయండి. MSP రూ.${bufferInfo.mspCurrentInrPerQtl} బోనస్ లభిస్తుంది.`;
    } else {
      sms160 = `ప్రభుత్వ MSP ${pincode}: ${crop.toUpperCase()} ఆమోదం! స్కోర్:${viability}%. MSP:రూ.${mspTotal}/Qtl. FCI కొనుగోలు గ్యారెంటీ టోకెన్ సిద్ధం.`;
    }
  } else {
    if (isHeritageConflict) {
      sms160 = `ALERT ${pincode}: Heritage GI zone conflict for ${crop}! Switch to ${altCrop} for guaranteed MSP Rs${mspTotal} procurement safety.`;
    } else if (isPaddyInDryzone) {
      sms160 = `ADVISORY ${pincode}: High water stress & national rice surplus. Switch to Millets/Pulses for guaranteed MSP Rs${mspTotal}/Qtl.`;
    } else {
      sms160 = `GOVT-MSP ${pincode}: ${crop.toUpperCase()} Approved. Viability:${viability}%. National deficit bridge. MSP:Rs${mspTotal}/Qtl guaranteed.`;
    }
  }

  if (sms160.length > 160) {
    sms160 = sms160.substring(0, 157) + '...';
  }

  const fallbackEvaluation = {
    viabilityScore: viability,
    sustainabilityScore: sustainability,
    nationalBufferMatch: isBufferDeficitMatch,
    nationalBufferStatus: bufferInfo.status,
    heritageGuardrailTriggered: isHeritageConflict,
    heritageConflictWarning: warning,
    mspGuaranteeEligible: !isHeritageConflict && !isPaddyInDryzone,
    recommendedAlternative: altCrop,
    smsAdvisory160: sms160,
    smsAdvisoryEn: `GOVT-MSP ${pincode}: ${crop.toUpperCase()} Viability:${viability}%. MSP:Rs${mspTotal}/Qtl. Guaranteed procurement bridge.`,
    detectedLanguage: language,
    recommendedMspInr: bufferInfo.mspCurrentInrPerQtl,
    procurementIncentiveInr: isBufferDeficitMatch ? bufferInfo.procurementBonusInrPerQtl : 0,
    scientificRationale: `${profile.districtName} 5-yr climate (${profile.fiveYearAvgRainfallMm}mm rain, pH ${profile.soilPh}) cross-referenced with national ${bufferInfo.cropNameEn} reserve (${bufferInfo.deficitSurplusPct}% deficit).`,
    weatherSoilSummary: {
      rainfallMm: profile.fiveYearAvgRainfallMm,
      rainfallStatus: profile.fiveYearAvgRainfallMm > 900 ? 'Adequate' : 'Semi-arid / Moderate',
      soilPh: profile.soilPh,
      soilType: profile.soilClassification,
      temperatureRange: `${profile.fiveYearAvgTempC}°C mean`,
    },
  };

  return { success: true, source: 'kisansetu-agro-engine', evaluation: fallbackEvaluation };
}

// 3. AI Suitability Evaluation Endpoint
app.post('/api/ai/evaluate-suitability', async (req, res) => {
  try {
    const { pincode, crop, farmAreaAcres, language, farmerPhone, farmerName } = req.body;
    if (!pincode || !crop) {
      return res.status(400).json({ error: 'Pincode and crop are required' });
    }

    const result = await evaluateCropSuitability({
      pincode,
      crop,
      farmAreaAcres: Number(farmAreaAcres) || 3,
      language: language || 'te',
      farmerPhone,
      farmerName,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Error in evaluate-suitability:', err);
    res.status(500).json({ error: err?.message || 'Suitability evaluation failed' });
  }
});

// 4. SMS Gateway: Webhook (Twilio standard or simulated)
app.post('/api/sms/webhook', async (req, res) => {
  try {
    const rawBody = req.body.Body || req.body.message || req.body.text || '';
    const fromNumber = req.body.From || req.body.phoneNumber || '+91-98480-99999';
    const toNumber = req.body.To || '+91-800-KISAN';
    const messageSid = req.body.MessageSid || `SM_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Parse Pincode and Crop
    const { pincode, crop } = parseSmsIntent(rawBody);

    // Detect language: if Telugu script or Andhra/Telangana pincode (50xxxx, 51xxxx, 52xxxx, 53xxxx)
    const isTeluguRegion = pincode.startsWith('50') || pincode.startsWith('51') || pincode.startsWith('52') || pincode.startsWith('53');
    const lang = isTeluguRegion ? 'te' : 'en';

    // Log inbound SMS
    const inboundLog = {
      id: `sms-in-${Date.now()}`,
      timestamp: Date.now(),
      direction: 'inbound',
      fromNumber,
      toNumber,
      body: rawBody,
      characterCount: rawBody.length,
      language: lang,
      pincode,
      parsedCrop: crop,
      status: 'delivered',
      messageSid,
    };
    cloudStore.smsLogs.unshift(inboundLog);

    // Run AI Brain
    const evalResult = await evaluateCropSuitability({
      pincode,
      crop,
      farmAreaAcres: 4,
      language: lang,
      farmerPhone: fromNumber,
      farmerName: 'Feature Phone Farmer',
    });

    const evaluation = evalResult.evaluation;
    const smsReplyText = evaluation.smsAdvisory160;

    // Create & Log Procurement Request
    const profile = REGIONAL_AGRO_REGISTRY[pincode] || { districtName: 'Telangana Agri Zone' };
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      timestamp: Date.now(),
      farmerPhone: fromNumber,
      farmerName: `Farmer (${fromNumber.slice(-4)})`,
      pincode,
      districtName: profile.districtName,
      requestedCrop: crop,
      farmAreaAcres: 4.0,
      soilPh: evaluation.weatherSoilSummary.soilPh,
      rainfallMm: evaluation.weatherSoilSummary.rainfallMm,
      viabilityScore: evaluation.viabilityScore,
      sustainabilityScore: evaluation.sustainabilityScore,
      nationalBufferStatus: evaluation.nationalBufferStatus,
      heritageConflict: evaluation.heritageGuardrailTriggered,
      heritageDetails: evaluation.heritageConflictWarning || undefined,
      status: evaluation.heritageGuardrailTriggered ? 'flagged_heritage' : 'pending',
      mspPricePerQtlInr: evaluation.recommendedMspInr,
      procurementIncentiveInr: evaluation.procurementIncentiveInr,
      smsAdvisoryDispatched: smsReplyText,
      source: req.body.Body ? 'twilio_webhook' : 'sms_keypad',
      language: lang,
    };
    cloudStore.procurementRequests.unshift(newReq);

    // Log outbound SMS
    const outboundLog = {
      id: `sms-out-${Date.now()}`,
      timestamp: Date.now(),
      direction: 'outbound',
      fromNumber: toNumber,
      toNumber: fromNumber,
      body: smsReplyText,
      characterCount: smsReplyText.length,
      language: lang,
      pincode,
      parsedCrop: crop,
      status: 'delivered',
      messageSid: `SM_REPLY_${Date.now()}`,
    };
    cloudStore.smsLogs.unshift(outboundLog);
    saveCloudStorage(cloudStore);

    // Format response: check if Twilio expects TwiML XML
    const acceptsXml = req.headers['content-type']?.includes('application/x-www-form-urlencoded') || req.headers.accept?.includes('xml');
    if (acceptsXml) {
      res.setHeader('Content-Type', 'text/xml');
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${smsReplyText}</Message></Response>`);
    }

    res.json({
      success: true,
      inbound: inboundLog,
      outbound: outboundLog,
      procurementRequest: newReq,
      smsReplyText,
      parsed: { pincode, crop },
      evaluation,
    });
  } catch (err: any) {
    console.error('Error in sms webhook:', err);
    res.status(500).json({ error: err?.message || 'SMS processing failed' });
  }
});

// 5. Procurement Requests Feed
app.get('/api/procurement-requests', (req, res) => {
  res.json({
    success: true,
    requests: cloudStore.procurementRequests || [],
    count: cloudStore.procurementRequests.length,
  });
});

// 6. Officer Action: Approve or Reject Procurement Request
app.post('/api/procurement-requests/:id/decision', (req, res) => {
  const { id } = req.params;
  const { status, officerNotes, officerName = 'DAO Officer' } = req.body;

  const reqIndex = cloudStore.procurementRequests.findIndex((r: any) => r.id === id);
  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const existing = cloudStore.procurementRequests[reqIndex];
  const preBookingToken = status === 'approved' 
    ? `TS-GOVT-MSP-${Math.floor(1000 + Math.random() * 9000)}` 
    : undefined;

  let smsNotification = '';
  if (status === 'approved') {
    smsNotification = `TS-GOVT CONFIRMED: Your ${existing.requestedCrop.toUpperCase()} procurement is APPROVED for ${existing.farmAreaAcres} acres. Pre-Booking Token: ${preBookingToken}. Guaranteed MSP: Rs${existing.mspPricePerQtlInr + (existing.procurementIncentiveInr || 0)}/Qtl.`;
  } else {
    smsNotification = `TS-GOVT UPDATE: Crop request for ${existing.requestedCrop.toUpperCase()} could not be pre-booked: ${officerNotes || 'Quota filled/ecological criteria'}. Contact Rythu Vedika.`;
  }

  if (smsNotification.length > 160) {
    smsNotification = smsNotification.substring(0, 157) + '...';
  }

  const updated = {
    ...existing,
    status,
    officerNotes,
    officerName,
    preBookingToken,
    approvedAt: Date.now(),
  };

  cloudStore.procurementRequests[reqIndex] = updated;

  // Log confirmation SMS sent to farmer
  cloudStore.smsLogs.unshift({
    id: `sms-confirm-${Date.now()}`,
    timestamp: Date.now(),
    direction: 'outbound',
    fromNumber: '+91-800-KISAN',
    toNumber: existing.farmerPhone,
    body: smsNotification,
    characterCount: smsNotification.length,
    language: existing.language || 'en',
    pincode: existing.pincode,
    status: 'delivered',
  });

  saveCloudStorage(cloudStore);

  res.json({
    success: true,
    request: updated,
    smsDispatched: smsNotification,
  });
});

// 7. SMS Logs
app.get('/api/sms-logs', (req, res) => {
  res.json({
    success: true,
    logs: cloudStore.smsLogs || [],
    count: cloudStore.smsLogs.length,
  });
});


// Vite Middleware & Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Telangana Rythu AI] Server listening on port ${PORT}`);
  });
}

startServer();
