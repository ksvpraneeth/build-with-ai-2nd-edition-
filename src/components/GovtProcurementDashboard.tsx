import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  Award, 
  Scale, 
  Send, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { NationalFoodBuffer, ProcurementRequest, Language } from '../types';
import { NATIONAL_FOOD_BUFFERS } from '../data/procurementData';

interface GovtProcurementDashboardProps {
  language: Language;
}

export const GovtProcurementDashboard: React.FC<GovtProcurementDashboardProps> = ({ language }) => {
  const [buffers, setBuffers] = useState<NationalFoodBuffer[]>(NATIONAL_FOOD_BUFFERS);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'flagged_heritage' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [actionModalReq, setActionModalReq] = useState<ProcurementRequest | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
  const [officerNotes, setOfficerNotes] = useState('');
  const [officerName, setOfficerName] = useState('Dr. K. Ramana (District Agri Officer, Warangal)');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch live buffers and requests
  const fetchData = async () => {
    setLoading(true);
    try {
      const [buffersRes, reqsRes] = await Promise.all([
        fetch('/api/national-buffers').then(r => r.json()).catch(() => null),
        fetch('/api/procurement-requests').then(r => r.json()).catch(() => null),
      ]);

      if (buffersRes?.buffers) {
        setBuffers(buffersRes.buffers);
      }
      if (reqsRes?.requests) {
        setRequests(reqsRes.requests);
      }
    } catch (err) {
      console.warn('Failed to fetch procurement data from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Live poll
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAction = (req: ProcurementRequest, type: 'approved' | 'rejected') => {
    setActionModalReq(req);
    setActionType(type);
    if (type === 'approved') {
      setOfficerNotes(`Procurement pre-approved under National Food Reserve Priority. Central Bonus of ₹${req.procurementIncentiveInr || 0}/Qtl credited.`);
    } else {
      setOfficerNotes(req.heritageConflict ? 'Declined: Conflict with protected GI Tag heritage soil ecology. Advised shifting to red gram or chilli.' : 'Declined: Quota saturated for season.');
    }
  };

  const handleSubmitDecision = async () => {
    if (!actionModalReq) return;
    setIsSubmittingDecision(true);
    try {
      const res = await fetch(`/api/procurement-requests/${actionModalReq.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          officerNotes,
          officerName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Request ${actionModalReq.id} marked as ${actionType.toUpperCase()}. Auto-SMS dispatched to farmer!`);
        setActionModalReq(null);
        fetchData();
      } else {
        alert('Failed to update decision: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error updating decision: ' + err.message);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesCrop = selectedCrop === 'all' || req.requestedCrop === selectedCrop;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      req.farmerName.toLowerCase().includes(q) ||
      req.farmerPhone.toLowerCase().includes(q) ||
      req.pincode.includes(q) ||
      req.districtName.toLowerCase().includes(q) ||
      req.requestedCrop.toLowerCase().includes(q);
    return matchesStatus && matchesCrop && matchesSearch;
  });

  // Calculate high level metrics
  const totalPending = requests.filter(r => r.status === 'pending').length;
  const totalApproved = requests.filter(r => r.status === 'approved').length;
  const totalHeritageFlagged = requests.filter(r => r.heritageConflict || r.status === 'flagged_heritage').length;
  const totalAcresCovered = requests
    .filter(r => r.status === 'approved')
    .reduce((acc, curr) => acc + (curr.farmAreaAcres || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12" id="govt-procurement-dashboard">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>National Food Security & Procurement Portal • District Level</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Govt Procurement & National Buffer Hub
            </h1>
            <p className="text-emerald-100/80 text-sm max-w-2xl">
              Real-time cross-referencing between central grain reserve deficits, regional 5-year soil/climate feasibility, and incoming farmer SMS requests. Safeguards heritage GI crops while eliminating distress selling.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm transition-all shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Live Refresh'}</span>
            </button>
          </div>
        </div>

        {/* High-level KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-800/40">
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-xs border border-white/10">
            <span className="text-xs text-emerald-300 font-medium">Pending Farmer Requests</span>
            <div className="text-2xl font-bold text-white mt-1">{totalPending}</div>
            <span className="text-xs text-emerald-200/60">Awaiting district sign-off</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-xs border border-white/10">
            <span className="text-xs text-emerald-300 font-medium">Pre-Approved Procurement</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{totalApproved}</div>
            <span className="text-xs text-emerald-200/60">{totalAcresCovered} acres guaranteed</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-xs border border-white/10">
            <span className="text-xs text-amber-300 font-medium">Heritage Guardrail Flags</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{totalHeritageFlagged}</div>
            <span className="text-xs text-amber-200/60">GI tag zones protected</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-xs border border-white/10">
            <span className="text-xs text-emerald-300 font-medium">Pulses Buffer Deficit</span>
            <div className="text-2xl font-bold text-red-400 mt-1">-55.6%</div>
            <span className="text-xs text-emerald-200/60">Active ₹650/Qtl bonus incentive</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: National Food Security Buffer Reserves Visualizer */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 space-y-4" id="national-food-buffers-visualizer">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-stone-900">
                Central Food Security Reserve Buffers (Live Deficits & MSP Incentives)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Data cross-referenced by AI when farmers send SMS. Deficit crops receive elevated viability scores and procurement priority tokens.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700">🔴 Critical Deficit</span>
            <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700">🔵 Heavy Surplus</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700">🟢 Stable Reserve</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {buffers.map(b => {
            const isDeficit = b.status === 'CRITICAL_DEFICIT' || b.status === 'DEFICIT';
            const isSurplus = b.status === 'EXTREME_SURPLUS';
            const percentWidth = Math.min(100, Math.max(10, Math.round((b.currentStockMillionTonnes / b.targetBufferMillionTonnes) * 100)));

            return (
              <div
                key={b.cropId}
                className={`p-4 rounded-xl border transition-all ${
                  isDeficit 
                    ? 'border-red-200 bg-red-50/40' 
                    : isSurplus 
                    ? 'border-blue-200 bg-blue-50/40' 
                    : 'border-emerald-200 bg-emerald-50/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-500">{b.category}</span>
                    <h3 className="font-bold text-stone-900 text-base">{b.cropNameEn}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isDeficit 
                      ? 'bg-red-600 text-white' 
                      : isSurplus 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {b.deficitSurplusPct > 0 ? `+${b.deficitSurplusPct}%` : `${b.deficitSurplusPct}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Current: <strong>{b.currentStockMillionTonnes}M MT</strong></span>
                    <span>Target: <strong>{b.targetBufferMillionTonnes}M MT</strong></span>
                  </div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDeficit ? 'bg-red-500' : isSurplus ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentWidth}%` }}
                    />
                  </div>
                </div>

                {/* MSP & Policy recommendation */}
                <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500">Base MSP:</span>
                    <span className="font-bold text-stone-900 ml-1">₹{b.mspCurrentInrPerQtl.toLocaleString()}</span>
                  </div>
                  {b.procurementBonusInrPerQtl > 0 && (
                    <div className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                      +₹{b.procurementBonusInrPerQtl} Bonus/Qtl
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-2 leading-tight">
                  {b.recommendedAction}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: The Live Farmer Request Feed */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-stone-200 space-y-6" id="procurement-feed">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-stone-900">
                Incoming Farmer Procurement Requests Feed
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Directly synthesized via the SMS Gateway. Verified with regional 5-year climate metrics and GI tag guardrails.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone, pincode, farmer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="py-1.5 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-700"
            >
              <option value="all">All Crops</option>
              <option value="red_gram">Red Gram / Kandulu</option>
              <option value="cotton">Cotton / Patti</option>
              <option value="paddy">Paddy / Rice</option>
              <option value="chilli">Chilli / Mirchi</option>
              <option value="millets">Millets / Jowar</option>
              <option value="soybean">Soybean</option>
              <option value="groundnut">Groundnut</option>
            </select>

            <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
              {(['all', 'pending', 'approved', 'flagged_heritage'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    filterStatus === tab
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {tab === 'all' && 'All'}
                  {tab === 'pending' && 'Pending'}
                  {tab === 'approved' && 'Approved'}
                  {tab === 'flagged_heritage' && 'GI Flagged'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl">
              <p className="text-stone-500 text-sm">No incoming requests match the selected criteria.</p>
              <button
                onClick={() => { setFilterStatus('all'); setSelectedCrop('all'); setSearchQuery(''); }}
                className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredRequests.map(req => {
              const isHeritageFlag = req.heritageConflict || req.status === 'flagged_heritage';
              const isApproved = req.status === 'approved';
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req.id}
                  className={`rounded-xl p-5 border transition-all ${
                    isHeritageFlag
                      ? 'bg-amber-50/40 border-amber-300'
                      : isApproved
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-white border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Farmer & Location Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 text-base">{req.farmerName}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md font-mono">
                          <Phone className="w-3 h-3" />
                          {req.farmerPhone}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-stone-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          PIN: <strong>{req.pincode}</strong> ({req.districtName})
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
                        <span>Proposed: <strong className="text-stone-900 uppercase font-bold">{req.requestedCrop}</strong></span>
                        <span>Farm Area: <strong>{req.farmAreaAcres} Acres</strong></span>
                        <span>Soil pH: <strong>{req.soilPh}</strong></span>
                        <span>5-Yr Rain: <strong>{req.rainfallMm} mm</strong></span>
                        <span className="text-stone-400">Source: {req.source === 'twilio_webhook' ? 'Twilio Webhook' : 'Feature Phone SMS'}</span>
                      </div>
                    </div>

                    {/* AI Scoring & Buffer Badge */}
                    <div className="flex items-center gap-4 self-start lg:self-center">
                      <div className="text-center px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-200">
                        <div className="text-xs text-stone-500">Viability</div>
                        <div className={`text-base font-bold ${
                          req.viabilityScore >= 80 ? 'text-emerald-700' : req.viabilityScore >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {req.viabilityScore}%
                        </div>
                      </div>

                      <div className="text-center px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-200">
                        <div className="text-xs text-stone-500">Sustainability</div>
                        <div className="text-base font-bold text-stone-800">{req.sustainabilityScore}%</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-stone-500">Target MSP</div>
                        <div className="text-sm font-bold text-emerald-700">
                          ₹{req.mspPricePerQtlInr.toLocaleString()}
                          {req.procurementIncentiveInr ? <span className="text-xs text-emerald-600 font-normal"> (+₹{req.procurementIncentiveInr})</span> : ''}
                        </div>
                        <span className="text-[10px] text-stone-400">per Quintal</span>
                      </div>
                    </div>

                    {/* Decision Action Buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleOpenAction(req, 'approved')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve MSP</span>
                          </button>

                          <button
                            onClick={() => handleOpenAction(req, 'rejected')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5 text-stone-500" />
                            <span>Reject / Alt</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                          {req.preBookingToken && (
                            <div className="text-[11px] font-mono text-emerald-900 font-semibold mt-0.5">
                              {req.preBookingToken}
                            </div>
                          )}
                        </div>
                      )}

                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-md">
                          <XCircle className="w-3.5 h-3.5 text-stone-500" />
                          Declined
                        </span>
                      )}

                      {isHeritageFlag && req.status !== 'approved' && (
                        <button
                          onClick={() => handleOpenAction(req, 'approved')}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 border border-amber-400 px-2.5 py-1 rounded-md transition-all"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Review Flag</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Heritage Warning Banner (if flagged) */}
                  {isHeritageFlag && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-100/70 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Heritage GI Guardrail Triggered:</strong> {req.heritageDetails || 'Pincode conflicts with regional GI-tagged crops or vulnerable drought ecology. Agricultural officers are advised to verify before issuance.'}
                      </div>
                    </div>
                  )}

                  {/* Dispatched SMS preview */}
                  {req.smsAdvisoryDispatched && (
                    <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Send className="w-3 h-3 text-stone-400" />
                        <span>SMS Dispatched to Farmer: </span>
                        <code className="text-stone-700 font-sans bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                          "{req.smsAdvisoryDispatched}"
                        </code>
                      </div>
                      <span className="text-[10px] text-stone-400">{req.smsAdvisoryDispatched.length}/160 chars</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Officer Approval / Rejection Decision */}
      {actionModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {actionType === 'approved' ? 'Confirm Government MSP Pre-Booking' : 'Decline / Redirect Crop Request'}
              </h3>
              <button 
                onClick={() => setActionModalReq(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Farmer:</span>
                <span className="font-bold text-stone-800">{actionModalReq.farmerName} ({actionModalReq.farmerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Location:</span>
                <span className="font-bold text-stone-800">Pincode {actionModalReq.pincode} • {actionModalReq.districtName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Crop & Area:</span>
                <span className="font-bold text-emerald-800 uppercase">{actionModalReq.requestedCrop} ({actionModalReq.farmAreaAcres} Acres)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Guaranteed MSP:</span>
                <span className="font-bold text-emerald-700">₹{actionModalReq.mspPricePerQtlInr + (actionModalReq.procurementIncentiveInr || 0)}/Qtl</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">Officer Signature & Designation</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">Officer Notes / SMS Notification</label>
              <textarea
                rows={3}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="Notes sent to farmer via outbound SMS..."
              />
              <p className="text-[11px] text-stone-400">
                An automatic 160-char SMS with Pre-Booking Token will be immediately transmitted to farmer phone {actionModalReq.farmerPhone}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setActionModalReq(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingDecision}
                onClick={handleSubmitDecision}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-all ${
                  actionType === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {isSubmittingDecision ? 'Transmitting...' : actionType === 'approved' ? 'Sign & Issue Token' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
