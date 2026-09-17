import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  Smartphone, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  MessageSquare, 
  Lightbulb, 
  Bug, 
  Coins, 
  CloudRain, 
  ArrowRight,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { Language, AssistantMessage, AgroScenarioRecommendation } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { REGIONAL_AGRO_REGISTRY } from '../data/procurementData';
import { ScenarioRecommendationsView } from './ScenarioRecommendationsView';
import { CropHeritageProtectionView } from './CropHeritageProtectionView';

interface RythuAiAssistantProps {
  language: Language;
  mode?: 'full' | 'floating';
  onNavigateToSms?: (draftText?: string) => void;
  onNavigateToGovt?: () => void;
  onCloseFloating?: () => void;
}

export const RythuAiAssistant: React.FC<RythuAiAssistantProps> = ({
  language,
  mode = 'full',
  onNavigateToSms,
  onNavigateToGovt,
  onCloseFloating,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [pincode, setPincode] = useState('501141');
  const [selectedCrop, setSelectedCrop] = useState('red_gram');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<'chat' | 'scenarios' | 'heritage'>('chat');

  const initialWelcome = language === 'te' 
    ? `నమస్కారం! నేను మీ **రైతు మిత్ర AI అసిస్టెంట్ (Rythu Mitra)**.\n\nతెలంగాణ వ్యవసాయ విశ్వవిద్యాలయం (PJTSAU) పరిశోధనలు, గత 5 సంవత్సరాల వాతావరణ రికార్డులు మరియు జాతీయ ఆహార నిల్వల (FCI) కొనుగోలు నిబంధనలపై నన్ను అనుసంధానించారు.\n\nమీరు నన్ను వీటిపై అడగవచ్చు:\n- 🌾 **పంటల సాగు & తెగుళ్ల నివారణ** (ఉదా: పత్తిలో గులాబీ రంగు పురుగు, మిర్చిలో నల్ల తామర)\n- 💰 **2026 కనీస మద్దతు ధర (MSP) & కొరత బోనస్** (ఉదా: కందులకు ₹8,200/క్విం.)\n- 📍 **వివిధ వ్యవసాయ దృశ్యాల సిఫార్సులు (Field Scenarios)**\n- 🛡️ **రైతు వారసత్వ పంటల రక్షణ & GI Tags (తాండూరు కందులు, వరంగల్ చపటా, గుంటూరు సన్నం)**\n- 📱 **2G కీప్యాడ్ ఫోన్ల కోసం 160 అక్షరాల SMS సలహాలు**.`
    : `Hello! I am your **Rythu Mitra AI Assistant**, grounded on PJTSAU agronomy models, 5-year Telangana climate metrics (2020-2025), and National Food Security Buffer reserves (FCI).\n\nAsk me anything about:\n- 🌾 **Crop Advisory & Pest Diagnosis** (Pink Bollworm, Blast, Black Thrips remedies)\n- 💰 **2026 Central MSP & Buffer Deficit Bonuses** (Red Gram ₹8,200/Qtl, Cotton ₹7,521/Qtl)\n- 🗺️ **PJTSAU Field Scenario Recommendations** (6 detailed agro-climatic scenarios)\n- 🛡️ **Crop Heritage & GI Protection** (Tandur Red Gram, Warangal Chapata, Guntur Sannam)\n- 📱 **160-Character SMS drafting for rural keypad phones**.`;

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: initialWelcome,
      timestamp: Date.now(),
      suggestedSms160: language === 'te'
        ? 'రైతు మిత్ర AI: కందులు MSP రూ.7550+రూ.650 బోనస్=రూ.8200/క్విం. పత్తి పురుగు మందులు, పంటల సలహాల కోసం ప్రశ్న అడగండి.'
        : 'Rythu Mitra AI: 2026 MSP prices, pest remedies & weather insights for Telangana. Ask any crop question!',
    },
  ]);

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    language === 'te' ? 'వివిధ వ్యవసాయ దృశ్యాల (Scenarios) సిఫార్సుల వివరాలు తెలపండి' : 'Show me recommendations for each field scenario',
    language === 'te' ? 'తాండూరు కందులు మరియు వరంగల్ చపటా మిర్చి GI వారసత్వ రక్షణ' : 'Explain Crop Heritage Protection & GI Tags for Telangana',
    language === 'te' ? 'పత్తిలో గులాబీ రంగు పురుగును సేంద్రీయంగా ఎలా నివారించాలి?' : 'How to manage Pink Bollworm in Cotton organically?',
    language === 'te' ? '2026 లో కందులకు కనీస మద్దతు ధర మరియు బోనస్ ఎంత?' : 'What is the 2026 MSP and bonus for Red Gram / Tur?',
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const profile = REGIONAL_AGRO_REGISTRY[pincode] || REGIONAL_AGRO_REGISTRY['501141'];

  const handleSelectScenarioForAi = (scenario: AgroScenarioRecommendation) => {
    setActiveSubView('chat');
    setPincode(scenario.pincode);
    const prompt = language === 'te'
      ? `${scenario.scenarioTitleTe} (${scenario.districtName}) గురించి పూర్తి వివరాలు, ఎకరానికి నీటి ఆదా, MSP మరియు పీజేటీఎస్ఏయూ సిఫార్సులను వివరించండి.`
      : `Please explain the detailed recommendations, water savings, 2026 MSP profitability, and action roadmap for "${scenario.scenarioTitleEn}" in ${scenario.districtName} (PIN: ${scenario.pincode}).`;
    handleSendMessage(prompt);
  };

  const handleNavigateToAiFromHeritage = (prompt: string) => {
    setActiveSubView('chat');
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: history,
          language,
          pincode,
          crop: selectedCrop,
          districtId: profile.districtId,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const assistantMsg: AssistantMessage = {
          id: `msg-asst-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
          suggestedSms160: data.smsSummary160,
          category: data.category || 'advisory',
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (Array.isArray(data.suggestedQuestions) && data.suggestedQuestions.length > 0) {
          setSuggestedQuestions(data.suggestedQuestions);
        }
      }
    } catch (err) {
      console.warn('Error in assistant call:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: language === 'te'
            ? 'క్షమించండి, సర్వర్ స్పందించడంలో తాత్కాలిక అంతరాయం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
            : 'Could not connect to the assistant server right now. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySms = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSpeak = (text: string, id: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Language selection for TTS
    if (language === 'te') {
      utterance.lang = 'te-IN';
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: initialWelcome,
        timestamp: Date.now(),
        suggestedSms160: language === 'te'
          ? 'రైతు మిత్ర AI: కందులు MSP రూ.7550+రూ.650 బోనస్=రూ.8200/క్విం. పత్తి పురుగు మందులు, పంటల సలహాల కోసం ప్రశ్న అడగండి.'
          : 'Rythu Mitra AI: 2026 MSP prices, pest remedies & weather insights for Telangana. Ask any crop question!',
      },
    ]);
  };

  // Preset topic groups
  const PRESET_GROUPS = [
    {
      title: language === 'te' ? 'తెగుళ్ల నివారణ (Pests)' : 'Pest Management',
      icon: Bug,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      questions: [
        language === 'te' ? 'పత్తిలో గులాబీ రంగు పురుగు సేంద్రీయ మందులు' : 'Organic control for Pink Bollworm in Cotton',
        language === 'te' ? 'మిర్చిలో నల్ల తామర పురుగు నివారణ' : 'Black Thrips management in Chilli crop',
        language === 'te' ? 'వరిలో అగ్గితెగులు (Blast) రాకుండా తీసుకోవాల్సిన జాగ్రత్తలు' : 'Paddy blast symptoms and fungicide dosage',
      ],
    },
    {
      title: language === 'te' ? 'కనీస మద్దతు ధర & బోనస్ (MSP)' : 'MSP & Procurement',
      icon: Coins,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      questions: [
        language === 'te' ? '2026 లో కందులకు బేస్ MSP మరియు బోనస్ ఎంత?' : '2026 MSP and deficit incentive for Red Gram?',
        language === 'te' ? 'రైతుకు FCI ప్రీ-బుకింగ్ టోకెన్ ఎలా వస్తుంది?' : 'How does a farmer get an FCI pre-booking token?',
        language === 'te' ? 'వరి నిల్వలు అధికంగా ఉన్నందున ఏ పంటలు వేయాలి?' : 'Why is Paddy surplus and which crops are incentivized?',
      ],
    },
    {
      title: language === 'te' ? 'వాతావరణం & నేలలు (Climate)' : 'Climate & Soils',
      icon: CloudRain,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      questions: [
        language === 'te' ? 'తాండూరు (501141) నల్లరేగడి నేలలో ఏ రకాలు వేయాలి?' : 'Best crop varieties for Tandur 501141 soil pH?',
        language === 'te' ? 'మహబూబ్‌నగర్ 509001 సెమీ-ఎరిడ్ ప్రాంతంలో తక్కువ నీటి పంటలు' : 'Low water crops for Mahbubnagar (509001)?',
        language === 'te' ? 'గత 5 సంవత్సరాల వర్షపాతం ఆధారంగా విత్తే సమయం' : 'Optimal sowing window based on 5-year rainfall',
      ],
    },
  ];

  return (
    <div className={`space-y-6 ${mode === 'full' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16' : ''}`} id="rythu-ai-assistant">
      {/* Top Banner (Full Mode) */}
      {mode === 'full' && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-700/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rythu Mitra AI • PJTSAU Agronomy Grounded • Gemini 3.8 Flash</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>రైతు మిత్ర AI అసిస్టెంట్</span>
                <span className="text-emerald-400 text-xl font-normal">/ Kisan AI Assistant</span>
              </h1>
              <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
                Your dedicated agricultural copilot. Ask questions regarding crop protection, 2026 MSP rates and deficit incentives, 5-year soil pH trends, or instantly draft cellular 160-character SMS advisories for feature phone farmers.
              </p>
            </div>

            {/* Status Pill */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="bg-stone-900/80 backdrop-blur-xs border border-emerald-600/40 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini 3.8 Flash Connected</span>
                </div>
                <div className="text-stone-300 text-[11px]">
                  Grounding: PJTSAU Agronomy & FCI Buffers
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Header (Floating Mode) */}
      {mode === 'floating' && (
        <div className="flex items-center justify-between p-4 bg-emerald-900 text-white rounded-t-2xl border-b border-emerald-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-300 border border-emerald-600">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold">Rythu Mitra AI Assistant</div>
              <div className="text-[10px] text-emerald-200">PJTSAU & FCI Procurement Grounded</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Clear conversation"
              className="p-1.5 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {onCloseFloating && (
              <button
                onClick={onCloseFloating}
                className="p-1.5 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-Views Switcher (Full and Floating Modes) */}
      <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto border border-stone-200 shadow-2xs">
        <button
          onClick={() => setActiveSubView('chat')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeSubView === 'chat'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{language === 'te' ? 'AI అసిస్టెంట్ చాట్' : 'AI Copilot & Chat'}</span>
        </button>

        <button
          onClick={() => setActiveSubView('scenarios')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeSubView === 'scenarios'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-300" />
          <span>{language === 'te' ? 'వ్యవసాయ దృశ్యాల సిఫార్సులు' : 'Scenario Recommendations'}</span>
          <span className="text-[10px] bg-emerald-950 text-emerald-200 px-1.5 py-0.2 rounded-full font-mono">
            6
          </span>
        </button>

        <button
          onClick={() => setActiveSubView('heritage')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeSubView === 'heritage'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-300" />
          <span>{language === 'te' ? 'రైతు వారసత్వ పంటల రక్షణ (GI)' : 'Crop Heritage & GI Protection'}</span>
          <span className="text-[10px] bg-amber-900 text-amber-200 px-1.5 py-0.2 rounded-full font-mono">
            GI-729
          </span>
        </button>
      </div>

      {/* Render Subview or Chat */}
      {activeSubView === 'scenarios' ? (
        <div className="bg-stone-50 rounded-2xl p-2 sm:p-4 border border-stone-200">
          <ScenarioRecommendationsView
            language={language}
            onSelectScenarioForAi={handleSelectScenarioForAi}
            onNavigateToSms={onNavigateToSms}
            onNavigateToGovt={onNavigateToGovt}
          />
        </div>
      ) : activeSubView === 'heritage' ? (
        <div className="bg-stone-50 rounded-2xl p-2 sm:p-4 border border-stone-200">
          <CropHeritageProtectionView
            language={language}
            onNavigateToAi={handleNavigateToAiFromHeritage}
            onNavigateToSms={onNavigateToSms}
            onNavigateToGovt={onNavigateToGovt}
          />
        </div>
      ) : (
        /* Main Grid: Context & Chat */
        <div className={`grid grid-cols-1 ${mode === 'full' ? 'lg:grid-cols-4' : ''} gap-6`}>
        {/* Left Side: Context & Quick Category Presets (Only in Full Mode) */}
        {mode === 'full' && (
          <div className="space-y-5">
            {/* Active Regional Context Card */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Farmer Farm Context</span>
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  PIN: {pincode}
                </span>
              </div>

              {/* Pincode select */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600">Target Region Pincode</label>
                <select
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800"
                >
                  <option value="501141">501141 - Tandur (Vikarabad / Tur GI)</option>
                  <option value="506001">506001 - Warangal (Cotton & Chilli)</option>
                  <option value="507001">507001 - Khammam (Pulses & Chilli)</option>
                  <option value="505001">505001 - Karimnagar (SRSP Paddy)</option>
                  <option value="509001">509001 - Mahbubnagar (Millets)</option>
                  <option value="508001">508001 - Nalgonda (Red Chalka)</option>
                  <option value="522001">522001 - Guntur (Sannam Chilli GI)</option>
                </select>
              </div>

              {/* Target Crop select */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600">Target Crop Focus</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800"
                >
                  <option value="red_gram">Red Gram / Kandulu (Pulses)</option>
                  <option value="cotton">Cotton / Patti (Fiber)</option>
                  <option value="paddy">Common Paddy (Cereal)</option>
                  <option value="chilli">Chilli / Mirchi (Spices)</option>
                  <option value="millets">Millets / Jowar (Nutri-Cereal)</option>
                  <option value="soybean">Soybean (Oilseed)</option>
                  <option value="groundnut">Groundnut (Oilseed)</option>
                </select>
              </div>

              {/* Agro Snapshot */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] space-y-1.5 text-stone-600">
                <div className="font-semibold text-stone-900">{profile.districtName}</div>
                <div>Soil: <strong className="text-stone-800">{profile.soilClassification}</strong> (pH {profile.soilPh})</div>
                <div>5-Yr Avg Rain: <strong className="text-stone-800">{profile.fiveYearAvgRainfallMm} mm</strong></div>
                {profile.giTagHeritageCrops?.length > 0 && (
                  <div className="text-amber-800 font-semibold pt-1">
                    GI Heritage: {profile.giTagHeritageCrops.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Categories */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
                Curated Agronomic Inquiries
              </div>
              {PRESET_GROUPS.map((group, idx) => {
                const IconComponent = group.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <div className={`p-1.5 rounded-lg ${group.color}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span>{group.title}</span>
                    </div>
                    <div className="space-y-1.5">
                      {group.questions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          disabled={isLoading}
                          className="w-full text-left text-[11px] p-2 rounded-lg bg-stone-50 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 transition-colors flex items-center justify-between group disabled:opacity-50"
                        >
                          <span className="line-clamp-2">{q}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-600 shrink-0 ml-1 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Side: Interactive Chat Console */}
        <div className={`${mode === 'full' ? 'lg:col-span-3' : 'w-full'} flex flex-col h-[650px] bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden`}>
          {/* Chat Toolbar */}
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                  <span>Rythu Mitra AI Assistant</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                    {language.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500">
                  Answering with 5-year climate data & PJTSAU advisories
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors shadow-2xs font-medium"
                title="Clear conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-stone-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Speech Bubble */}
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-emerald-700 text-white rounded-tr-xs'
                          : 'bg-white text-stone-900 border border-stone-200 rounded-tl-xs'
                      }`}
                    >
                      {/* Message Content with simple Markdown rendering */}
                      <div className="whitespace-pre-line space-y-1">
                        {msg.content.split('\n\n').map((paragraph, pIdx) => {
                          // Format bold text
                          const formatted = paragraph.replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong>$1</strong>'
                          );
                          return (
                            <p
                              key={pIdx}
                              dangerouslySetInnerHTML={{ __html: formatted }}
                              className="mb-2 last:mb-0"
                            />
                          );
                        })}
                      </div>

                      {/* Timestamp & Action Bar */}
                      <div
                        className={`flex items-center justify-between gap-4 mt-3 pt-2 text-[10px] border-t ${
                          isUser ? 'border-emerald-600 text-emerald-200' : 'border-stone-100 text-stone-400'
                        }`}
                      >
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        {!isUser && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSpeak(msg.content, msg.id)}
                              className={`p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1 ${
                                speakingId === msg.id ? 'text-emerald-700 font-bold' : ''
                              }`}
                              title="Listen out loud"
                            >
                              {speakingId === msg.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-red-500" />
                                  <span className="text-red-500 text-[10px]">Stop Audio</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attached 160-Character SMS Card (if generated) */}
                    {!isUser && msg.suggestedSms160 && (
                      <div className="bg-[#a4c297] text-stone-950 p-3.5 rounded-xl border-2 border-stone-600 shadow-inner space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between text-[10px] opacity-75 font-bold">
                          <span>SMS ADVISORY (GSM-7)</span>
                          <span>{msg.suggestedSms160.length}/160 CHARS</span>
                        </div>
                        <p className="font-bold text-xs leading-snug">{msg.suggestedSms160}</p>
                        
                        <div className="flex items-center justify-between pt-1 border-t border-stone-600/30">
                          <button
                            onClick={() => handleCopySms(msg.suggestedSms160!, msg.id)}
                            className="inline-flex items-center gap-1 text-[10px] bg-stone-900 text-white px-2.5 py-1 rounded-md font-sans font-semibold hover:bg-stone-800 active:scale-95 transition-all"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy 160-Char SMS</span>
                              </>
                            )}
                          </button>

                          {onNavigateToSms && (
                            <button
                              onClick={() => onNavigateToSms(msg.suggestedSms160)}
                              className="inline-flex items-center gap-1 text-[10px] text-stone-900 hover:text-stone-950 font-sans font-bold underline"
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>Dispatch in SMS Keypad</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <span className="text-xs font-bold">YOU</span>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 text-stone-500 text-xs flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Rythu Mitra AI is analyzing PJTSAU crop data & MSP rates...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Follow-up Prompts */}
          {suggestedQuestions.length > 0 && !isLoading && (
            <div className="p-3 bg-stone-50/90 border-t border-stone-200 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Suggested:</span>
              </span>
              {suggestedQuestions.slice(0, 3).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-[11px] bg-white hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 text-stone-700 px-3 py-1.5 rounded-full shrink-0 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'te'
                    ? 'మీ పంట, పురుగు మందులు, లేదా 2026 MSP ధరలపై ప్రశ్న అడగండి...'
                    : 'Ask about crop remedies, sowing dates, 2026 MSP bonuses, or pest management...'
                }
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-stone-900 placeholder:text-stone-400"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 sm:px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 px-1">
              <span>Grounding: PJTSAU University Advisory Guidelines • 5-Year Climate Data</span>
              <span>Available in Telugu, English, Hindi, Urdu</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
