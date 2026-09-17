import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  MapPin, 
  FileText, 
  Scale, 
  Radio, 
  Clock, 
  Volume2, 
  Copy, 
  Check,
  AlertTriangle
} from 'lucide-react';
import { Language } from '../types';

interface FarmerSmsGatewayProps {
  language: Language;
}

interface SmsMessage {
  id: string;
  sender: 'farmer' | 'system';
  text: string;
  timestamp: string;
  charCount: number;
}

export const FarmerSmsGateway: React.FC<FarmerSmsGatewayProps> = ({ language }) => {
  const [pincodeInput, setPincodeInput] = useState('501141');
  const [cropInput, setCropInput] = useState('Kandulu');
  const [phoneNumber, setPhoneNumber] = useState('+91-98480-12345');
  const [smsDraft, setSmsDraft] = useState('501141 Kandulu');
  const [messages, setMessages] = useState<SmsMessage[]>([
    {
      id: 'm-1',
      sender: 'farmer',
      text: '501141 Kandulu',
      timestamp: '10:14 AM',
      charCount: 14,
    },
    {
      id: 'm-2',
      sender: 'system',
      text: 'TS-GOVT: 501141 Kandulu APPROVED. Viability:96%. Buffer Deficit:55%. MSP:Rs7550+Rs650 bonus. Pre-booking Token: TS-TANDUR-MSP-8910. Seed:PRG-176.',
      timestamp: '10:14 AM',
      charCount: 146,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'parser' | 'climate' | 'ai_json' | 'twilio' | 'logs'>('parser');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync draft when inputs change
  useEffect(() => {
    setSmsDraft(`${pincodeInput.trim()} ${cropInput.trim()}`);
  }, [pincodeInput, cropInput]);

  const fetchSmsLogs = async () => {
    try {
      const res = await fetch('/api/sms-logs');
      const data = await res.json();
      if (data.logs) {
        setSmsLogs(data.logs);
      }
    } catch (e) {
      console.warn('Could not load SMS logs:', e);
    }
  };

  useEffect(() => {
    fetchSmsLogs();
  }, []);

  const handleSendSms = async (overrideText?: string) => {
    const textToSend = overrideText || smsDraft;
    if (!textToSend.trim() || isProcessing) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: SmsMessage = {
      id: `usr-${Date.now()}`,
      sender: 'farmer',
      text: textToSend,
      timestamp: timeStr,
      charCount: textToSend.length,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/sms/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Body: textToSend,
          From: phoneNumber,
          To: '+91-800-KISAN',
          MessageSid: `SM_${Date.now()}`,
        }),
      });

      const data = await response.json();
      setLastAnalysis(data);

      const replyText = data.smsReplyText || data.evaluation?.smsAdvisory160 || 'TS-GOVT: Advisory processed.';
      const systemMsg: SmsMessage = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        charCount: replyText.length,
      };

      setMessages(prev => [...prev, systemMsg]);
      fetchSmsLogs();
    } catch (err: any) {
      const errorMsg: SmsMessage = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: 'TS-GOVT ERROR: Network timeout. Please re-send your 6-digit Pincode and Crop.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        charCount: 78,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetScenario = (pincode: string, crop: string, label: string) => {
    setPincodeInput(pincode);
    setCropInput(crop);
    const combined = `${pincode} ${crop}`;
    setSmsDraft(combined);
    handleSendSms(combined);
  };

  const handleKeypadPress = (char: string) => {
    setSmsDraft(prev => prev + char);
  };

  const handleClearKeypad = () => {
    setSmsDraft(prev => prev.slice(0, -1));
  };

  const handleCopyTwilioCurl = () => {
    const curl = `curl -X POST http://localhost:3000/api/sms/webhook \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "From=%2B919848012345&To=%2B9180054726&Body=501141+Kandulu"`;
    navigator.clipboard.writeText(curl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12" id="farmer-sms-gateway">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Inclusive Rural Pipeline • 2G / SMS Compatible (Twilio + Gemini)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Farmer SMS Gateway & Keypad Phone Simulator
          </h1>
          <p className="text-amber-100/80 text-sm max-w-3xl">
            Solves the rural connectivity barrier. Farmers on basic feature phones send an SMS formatted as <code>"Pincode Crop"</code> (e.g. <code>"501141 Kandulu"</code>). The AI Brain runs 5-year climate analysis, checks national buffers, enforces heritage GI guardrails, and responds in under 160 characters.
          </p>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: The Interactive Keypad Phone (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-stone-800 rounded-[44px] p-4 shadow-2xl border-4 border-stone-700 relative">
            {/* Phone Earpiece */}
            <div className="w-16 h-1.5 bg-stone-600 rounded-full mx-auto mb-3" />

            {/* Phone Screen Display */}
            <div className="bg-[#a4c297] text-stone-900 font-mono rounded-2xl p-3 shadow-inner border-2 border-stone-600 space-y-2 h-[340px] flex flex-col justify-between overflow-hidden">
              {/* Status bar */}
              <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-stone-700/40">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  <span>BSNL 2G</span>
                </span>
                <span>SMS (91-800-KISAN)</span>
                <span>100%</span>
              </div>

              {/* Message Thread Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs py-1 text-stone-900">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg text-[11px] leading-tight ${
                      msg.sender === 'farmer'
                        ? 'bg-[#89a87d] ml-6 border border-stone-700/30'
                        : 'bg-[#b6d4a8] mr-4 border border-stone-700/40 shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold opacity-75 mb-0.5">
                      <span>{msg.sender === 'farmer' ? 'YOU (Farmer)' : 'GOVT ADVISORY'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="font-semibold break-words">{msg.text}</p>
                    <div className="text-[8px] opacity-60 text-right mt-0.5">
                      {msg.charCount}/160 chars
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="text-[10px] italic animate-pulse text-stone-700">
                    Connecting to PJTSAU & National Buffer AI...
                  </div>
                )}
              </div>

              {/* Draft Box & Char Counter */}
              <div className="pt-1.5 border-t border-stone-700/40 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold">Text Message:</span>
                  <span className={`font-bold ${smsDraft.length > 160 ? 'text-red-800' : 'text-stone-800'}`}>
                    {smsDraft.length} / 160
                  </span>
                </div>
                <input
                  type="text"
                  value={smsDraft}
                  onChange={(e) => setSmsDraft(e.target.value)}
                  placeholder="e.g. 501141 Kandulu"
                  className="w-full bg-[#8fae83] text-stone-900 font-mono text-xs px-2 py-1.5 rounded-md border border-stone-700/50 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Action Bar / Softkeys */}
            <div className="flex justify-between px-3 py-2 mt-2 text-[10px] font-bold text-stone-300">
              <button 
                onClick={() => handleSendSms()}
                disabled={isProcessing}
                className="hover:text-emerald-400 disabled:opacity-50"
              >
                [SEND]
              </button>
              <button 
                onClick={handleClearKeypad}
                className="hover:text-amber-400"
              >
                [CLEAR]
              </button>
            </div>

            {/* Navigation Pad & Call/End buttons */}
            <div className="grid grid-cols-3 gap-2 px-2 mt-1">
              <button
                onClick={() => handleSendSms()}
                disabled={isProcessing}
                className="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white rounded-xl py-2 flex items-center justify-center font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
              <div className="bg-stone-700 rounded-xl flex items-center justify-center text-stone-400 text-[10px] font-mono">
                OK
              </div>
              <button
                onClick={() => setMessages([])}
                className="bg-red-800 hover:bg-red-700 active:bg-red-900 text-white rounded-xl py-2 flex items-center justify-center font-bold text-xs shadow-md"
                title="Clear Messages"
              >
                ✕
              </button>
            </div>

            {/* Keypad Numeric Matrix */}
            <div className="grid grid-cols-3 gap-1.5 p-2 mt-2 bg-stone-900/60 rounded-2xl">
              {[
                { num: '1', sub: '.,' },
                { num: '2', sub: 'ABC' },
                { num: '3', sub: 'DEF' },
                { num: '4', sub: 'GHI' },
                { num: '5', sub: 'JKL' },
                { num: '6', sub: 'MNO' },
                { num: '7', sub: 'PQRS' },
                { num: '8', sub: 'TUV' },
                { num: '9', sub: 'WXYZ' },
                { num: '*', sub: '+' },
                { num: '0', sub: '␣' },
                { num: '#', sub: '⇧' },
              ].map(k => (
                <button
                  key={k.num}
                  onClick={() => handleKeypadPress(k.num === '0' ? ' ' : k.num)}
                  className="bg-stone-700 hover:bg-stone-600 active:bg-stone-800 text-stone-100 rounded-lg py-1.5 text-center transition-all shadow-xs"
                >
                  <div className="font-bold text-sm leading-none">{k.num}</div>
                  <div className="text-[9px] text-stone-400 tracking-tighter leading-none">{k.sub}</div>
                </button>
              ))}
            </div>

            {/* Simulated Phone Speaker Grille */}
            <div className="flex justify-center gap-1.5 mt-3">
              <div className="w-1 h-1 bg-stone-600 rounded-full" />
              <div className="w-1 h-1 bg-stone-600 rounded-full" />
              <div className="w-1 h-1 bg-stone-600 rounded-full" />
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-3 text-center">
            Virtual 2G Keypad Handset • Works offline over GSM Cellular Networks
          </p>
        </div>

        {/* RIGHT COLUMN: Scenarios & Central Hub Inspector (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick-Tap Scenarios */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Test Preset SMS Scenarios (Click to Dispatch)</span>
              </h2>
              <span className="text-[11px] text-stone-400">One-tap simulation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handlePresetScenario('501141', 'Kandulu', 'Tandur Red Gram')}
                className="text-left p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>501141 Kandulu</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-600 text-white">Pulse Deficit</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Tandur Red Gram (GI Tag). Bridges national 55% deficit. Pre-approved for ₹7,550 + ₹650 Bonus.
                </p>
              </button>

              <button
                onClick={() => handlePresetScenario('522001', 'Paddy', 'Guntur Chilli Zone')}
                className="text-left p-3 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>522001 Paddy</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-600 text-white">GI Guardrail Flag</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Guntur Sannam Chilli GI belt. Flooding degrades soil. Triggers Ethical Guardrail & suggests chilli.
                </p>
              </button>

              <button
                onClick={() => handlePresetScenario('509001', 'Paddy', 'Mahbubnagar Semi-Arid')}
                className="text-left p-3 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-100/60 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>509001 Paddy</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-600 text-white">Water Stress</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Semi-arid rainfall (610mm) & +108% rice surplus. Advisory directs farmer to millets for bonus.
                </p>
              </button>

              <button
                onClick={() => handlePresetScenario('506001', 'Cotton', 'Warangal Cotton')}
                className="text-left p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                  <span>506001 Cotton</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-700 text-white">Black Cotton</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Warangal Chapata & Cotton belt. pH 7.8 compatibility. CCI minimum support price guarantee.
                </p>
              </button>
            </div>
          </div>

          {/* Central Hub Inspector Tabs */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-stone-900 text-sm">Central Hub & AI Pipeline Inspector</h3>
              </div>

              <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('parser')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'parser' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Parser
                </button>
                <button
                  onClick={() => setActiveTab('climate')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'climate' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  5-Yr Climate
                </button>
                <button
                  onClick={() => setActiveTab('ai_json')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'ai_json' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  AI Output
                </button>
                <button
                  onClick={() => setActiveTab('twilio')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'twilio' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Twilio Webhook
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'logs' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  SMS Logs ({smsLogs.length})
                </button>
              </div>
            </div>

            {/* TAB 1: Incoming SMS Parser */}
            {activeTab === 'parser' && (
              <div className="space-y-3 text-xs">
                <p className="text-stone-600">
                  How the system extracts entities from low-tech SMS without requiring smartphone apps:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Input Text</span>
                    <div className="font-mono font-bold text-stone-900 mt-1">{lastAnalysis?.inbound?.body || smsDraft}</div>
                    <span className="text-[10px] text-stone-400">Raw GSM-7 SMS String</span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Parsed Pincode</span>
                    <div className="font-mono font-bold text-emerald-700 mt-1">{lastAnalysis?.parsed?.pincode || pincodeInput}</div>
                    <span className="text-[10px] text-stone-400">Regex 6-digit matched</span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Normalized Crop</span>
                    <div className="font-mono font-bold text-emerald-700 uppercase mt-1">{lastAnalysis?.parsed?.crop || cropInput}</div>
                    <span className="text-[10px] text-stone-400">Multi-lingual dictionary</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Multi-Language Dictionary Supported</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Accepts Telugu (వరి, పత్తి, కందులు, మిర్చి, జొన్నలు), Hindi (धान, कपास, अरहर), and English spellings.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Attached 5-Year Climate Data */}
            {activeTab === 'climate' && (
              <div className="space-y-3 text-xs">
                <p className="text-stone-600">
                  Regional agro-profile dynamically retrieved for Pincode {pincodeInput}:
                </p>
                {lastAnalysis?.evaluation?.weatherSoilSummary ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <span className="text-stone-500 text-[10px]">5-Yr Rainfall</span>
                      <div className="font-bold text-stone-900 text-sm mt-0.5">{lastAnalysis.evaluation.weatherSoilSummary.rainfallMm} mm</div>
                      <span className="text-[10px] text-stone-400">{lastAnalysis.evaluation.weatherSoilSummary.rainfallStatus}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <span className="text-stone-500 text-[10px]">Soil pH</span>
                      <div className="font-bold text-stone-900 text-sm mt-0.5">{lastAnalysis.evaluation.weatherSoilSummary.soilPh}</div>
                      <span className="text-[10px] text-stone-400">Optimum: 6.5 - 7.5</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <span className="text-stone-500 text-[10px]">Soil Classification</span>
                      <div className="font-bold text-stone-900 text-xs mt-0.5">{lastAnalysis.evaluation.weatherSoilSummary.soilType}</div>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <span className="text-stone-500 text-[10px]">Mean Temp</span>
                      <div className="font-bold text-stone-900 text-xs mt-0.5">{lastAnalysis.evaluation.weatherSoilSummary.temperatureRange}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-stone-50 rounded-xl text-stone-500 text-center">
                    Send an SMS test message to view regional weather profile attachments.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Gemini AI Structured Output */}
            {activeTab === 'ai_json' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-mono">Response schema (Strict JSON)</span>
                  <span className="text-emerald-700 font-bold font-mono">Engine: {lastAnalysis?.source || 'gemini-3.8-flash'}</span>
                </div>
                <pre className="bg-stone-900 text-emerald-400 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 border border-stone-800">
                  {lastAnalysis?.evaluation 
                    ? JSON.stringify(lastAnalysis.evaluation, null, 2)
                    : `{\n  "viabilityScore": 96,\n  "sustainabilityScore": 94,\n  "nationalBufferMatch": true,\n  "nationalBufferStatus": "DEFICIT",\n  "heritageGuardrailTriggered": false,\n  "smsAdvisory160": "TS-GOVT: 501141 Kandulu APPROVED. Viability:96%. Buffer Deficit:55%. MSP:Rs7550+Rs650 bonus. Pre-booking Token: TS-TANDUR-MSP-8910. Seed:PRG-176.",\n  "recommendedMspInr": 7550,\n  "procurementIncentiveInr": 650\n}`}
                </pre>
              </div>
            )}

            {/* TAB 4: Twilio Webhook Integration */}
            {activeTab === 'twilio' && (
              <div className="space-y-3 text-xs">
                <p className="text-stone-600">
                  Configure this webhook in your Twilio Console phone number configuration to receive live farmer SMS in production:
                </p>
                <div className="bg-stone-900 text-stone-200 p-3 rounded-xl font-mono text-[11px] space-y-2">
                  <div className="text-stone-400">// Production Webhook Endpoint (POST):</div>
                  <div className="text-amber-400 font-bold">https://your-domain.run.app/api/sms/webhook</div>
                  <div className="text-stone-400">// Expected Parameters: Body, From, To, MessageSid</div>
                  <div className="text-emerald-400">// Responds with TwiML: &lt;Response&gt;&lt;Message&gt;...&lt;/Message&gt;&lt;/Response&gt;</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-stone-500 font-mono text-[11px]">Test using cURL:</span>
                  <button
                    onClick={handleCopyTwilioCurl}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied to clipboard' : 'Copy cURL command'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: SMS Logs */}
            {activeTab === 'logs' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                {smsLogs.length === 0 ? (
                  <p className="text-stone-400 text-center py-6">No SMS messages logged yet.</p>
                ) : (
                  smsLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                            log.direction === 'inbound' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {log.direction}
                          </span>
                          <span className="font-mono text-stone-600 text-[11px]">{log.fromNumber} → {log.toNumber}</span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-stone-800 font-mono text-[11px] break-all">{log.body}</p>
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0">{log.characterCount}/160</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
