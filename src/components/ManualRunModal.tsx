import React, { useState, useMemo } from 'react';
import { 
  X, 
  Play, 
  Calendar, 
  Users, 
  Car, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  Search, 
  Send, 
  ArrowLeft, 
  Download, 
  Star, 
  Crown, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  Filter
} from 'lucide-react';
import { ModelListingItem, AllocationMatchItem } from '../types';
import { ALLOCATION_MATCH_DATA } from '../data';

interface ManualRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelListingItem;
  onSendForApproval: (modelId: string, details: { serviceDate: string; partners: string[]; chauffeurs: string[] }) => void;
}

const AVAILABLE_PARTNERS_LIST = [
  'Biztravex',
  'White whale',
  'AB Transfer',
  'KTC',
  'Truway',
  'Apex Limousine',
  'EcoFleet'
];

export const ManualRunModal: React.FC<ManualRunModalProps> = ({
  isOpen,
  onClose,
  model,
  onSendForApproval,
}) => {
  // Step: 'configure' | 'results'
  const [step, setStep] = useState<'configure' | 'results'>('configure');

  // Configuration form state
  const [serviceDate, setServiceDate] = useState<string>('2026-10-07');
  const [selectedPartners, setSelectedPartners] = useState<string[]>(
    model.partners && model.partners.length > 0 ? [...model.partners] : ['Biztravex', 'White whale']
  );

  // Hidden optional field: Chauffeur multi-select
  const [isChauffeurSectionOpen, setIsChauffeurSectionOpen] = useState(false);
  const [selectedChauffeurs, setSelectedChauffeurs] = useState<string[]>([]);
  const [chauffeurSearch, setChauffeurSearch] = useState('');

  // Results search & filters
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsTagFilter, setResultsTagFilter] = useState<'all' | 'VIP' | 'Normal'>('all');
  const [isRunning, setIsRunning] = useState(false);

  // Derive unique chauffeurs from ALLOCATION_MATCH_DATA matching selected partners
  const availableChauffeurs = useMemo(() => {
    const list: { name: string; vendor: string }[] = [];
    const seen = new Set<string>();

    ALLOCATION_MATCH_DATA.forEach((item) => {
      if (!seen.has(item.chauffeurName)) {
        seen.add(item.chauffeurName);
        list.push({ name: item.chauffeurName, vendor: item.vendor });
      }
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredChauffeurOptions = useMemo(() => {
    return availableChauffeurs.filter((c) => {
      // Prioritize chauffeurs belonging to selected partners if any partners selected
      const vendorMatch = selectedPartners.length === 0 || selectedPartners.includes(c.vendor);
      if (!vendorMatch) return false;

      if (chauffeurSearch.trim()) {
        const q = chauffeurSearch.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.vendor.toLowerCase().includes(q);
      }
      return true;
    });
  }, [availableChauffeurs, selectedPartners, chauffeurSearch]);

  // Format service date for display
  const formattedDisplayDate = useMemo(() => {
    if (!serviceDate) return '07 Oct 2026';
    const parts = serviceDate.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${parts[2]} ${monthNames[monthIdx] || parts[1]} ${parts[0]}`;
    }
    return serviceDate;
  }, [serviceDate]);

  // Partners toggle
  const togglePartner = (partner: string) => {
    if (selectedPartners.includes(partner)) {
      if (selectedPartners.length === 1) {
        alert('Please keep at least one partner selected.');
        return;
      }
      setSelectedPartners(selectedPartners.filter((p) => p !== partner));
    } else {
      setSelectedPartners([...selectedPartners, partner]);
    }
  };

  const selectAllPartners = () => {
    setSelectedPartners([...AVAILABLE_PARTNERS_LIST]);
  };

  // Chauffeurs toggle
  const toggleChauffeur = (name: string) => {
    if (selectedChauffeurs.includes(name)) {
      setSelectedChauffeurs(selectedChauffeurs.filter((c) => c !== name));
    } else {
      setSelectedChauffeurs([...selectedChauffeurs, name]);
    }
  };

  // Run simulation handler
  const handleRunSimulation = () => {
    if (selectedPartners.length === 0) {
      alert('Please select at least one partner.');
      return;
    }
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setStep('results');
    }, 350);
  };

  // Simulated results dataset derived from allocation match data
  const simulatedResults = useMemo(() => {
    return ALLOCATION_MATCH_DATA.filter((item) => {
      // 1. Partner filter
      if (selectedPartners.length > 0 && !selectedPartners.includes(item.vendor)) {
        return false;
      }

      // 2. Chauffeur filter (if user selected any specific chauffeurs)
      if (selectedChauffeurs.length > 0 && !selectedChauffeurs.includes(item.chauffeurName)) {
        return false;
      }

      // 3. Search query in results
      if (resultsSearch.trim()) {
        const q = resultsSearch.toLowerCase();
        const match =
          item.bookingId.toLowerCase().includes(q) ||
          item.chauffeurName.toLowerCase().includes(q) ||
          item.vendor.toLowerCase().includes(q) ||
          item.program.toLowerCase().includes(q) ||
          item.benefitGroup.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 4. Tag filter
      if (resultsTagFilter !== 'all' && item.tag !== resultsTagFilter) {
        return false;
      }

      return true;
    });
  }, [selectedPartners, selectedChauffeurs, resultsSearch, resultsTagFilter]);

  // Summary KPIs for the simulated outcome
  const totalRevenue = simulatedResults.reduce((acc, c) => acc + c.revenue, 0);
  const totalCost = simulatedResults.reduce((acc, c) => acc + c.cost, 0);
  const totalDemandMarginAmount = simulatedResults.reduce((acc, c) => acc + Math.round(c.revenue * (c.margin / 100)), 0);
  const totalActualMarginAmount = totalRevenue - totalCost;

  const blendedDemandMarginPct = totalRevenue > 0
    ? ((totalDemandMarginAmount / totalRevenue) * 100).toFixed(1)
    : '0';

  const blendedActualMarginPct = totalRevenue > 0 
    ? ((totalActualMarginAmount / totalRevenue) * 100).toFixed(1)
    : '0';

  const avgScore = simulatedResults.length > 0
    ? (simulatedResults.reduce((acc, c) => acc + c.score, 0) / simulatedResults.length).toFixed(1)
    : '0';

  const preferredPct = simulatedResults.length > 0
    ? ((simulatedResults.filter((c) => c.group === 'Preferred').length / simulatedResults.length) * 100).toFixed(1)
    : '0';

  const avgScoreChange = simulatedResults.length > 0
    ? Math.round(simulatedResults.reduce((acc, c) => acc + (c.scoreChanged ?? 10), 0) / simulatedResults.length)
    : 10;

  const totalIssuesCount = simulatedResults.reduce(
    (acc, c) => acc + c.noShow + c.dsatRatings + c.fatalComplaints + c.softWarning + c.criticalWarning,
    0
  );

  // Send for approval
  const handleSendForApproval = () => {
    onSendForApproval(model.id, {
      serviceDate: formattedDisplayDate,
      partners: selectedPartners,
      chauffeurs: selectedChauffeurs,
    });
  };

  // Export CSV of simulation
  const handleExportCSV = () => {
    const headers = [
      'Booking ID', 'Benefit Group', 'Program', 'Card Variant', 'Revenue', 'Tag', 'Demand Margin (INR)', 'Demand Margin (%)', 'Service Date',
      'Rank', 'Chauffeur Name', 'Vendor', 'Score', 'Group', 'Booking Completed', 'On Time %', 'Happy Ratings', 'Issues', 'Cost',
      'Actual Margin (INR)', 'Actual Margin (%)', 'Actual CSAT', 'Score changed', 'Complaint', 'Warnings'
    ];

    const rows = simulatedResults.map((d) => {
      const demandMarginVal = Math.round(d.revenue * (d.margin / 100));
      const actualMarginVal = d.revenue - d.cost;
      const rankTier = d.rankTier || (d.rank <= 3 ? 'Top 10' : d.rank <= 6 ? 'Top 25' : 'Top 50');
      const totalIssues = d.noShow + d.dsatRatings + d.fatalComplaints + d.softWarning + d.criticalWarning;
      const scoreChangeStr = `(+${d.scoreChanged ?? 10})`;
      return [
        d.bookingId, d.benefitGroup, d.program, d.cardVariant, d.revenue, d.tag, demandMarginVal, `${d.margin}%`, d.serviceDate,
        rankTier, d.chauffeurName, d.vendor, d.score, d.group, d.bookingCompleted, d.onTime, d.happyRatings, totalIssues, d.cost,
        actualMarginVal, `${d.actualMargin}%`, d.actualCsat, scoreChangeStr, d.hasComplaint ? 'Y' : 'N', d.hasWarnings ? 'Y' : 'N'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manual_run_${model.version}_${formattedDisplayDate.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {step === 'configure' ? (
        /* POPUP 1: Manual Run Configuration */
        <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative text-slate-800">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Manual Run Simulation</h3>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">
                    {model.version}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure simulation parameters for model <strong>{model.model}</strong> ({model.benefit})
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Inputs */}
          <div className="mt-5 space-y-5">
            {/* 1. Service Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                Service Date <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400 shadow-2xs cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setServiceDate('2026-10-07')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      serviceDate === '2026-10-07'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Today (07 Oct)
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceDate('2026-10-08')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      serviceDate === '2026-10-08'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Selected date: <strong className="text-slate-700">{formattedDisplayDate}</strong>
              </p>
            </div>

            {/* 2. Partners (Multi-Select) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Partners (Multi Select) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selectAllPartners}
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-slate-500 font-mono">
                    {selectedPartners.length} of {AVAILABLE_PARTNERS_LIST.length} selected
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {AVAILABLE_PARTNERS_LIST.map((partner) => {
                  const isChecked = selectedPartners.includes(partner);
                  return (
                    <label
                      key={partner}
                      onClick={() => togglePartner(partner)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all select-none ${
                        isChecked
                          ? 'bg-white text-slate-900 border-slate-300 shadow-2xs font-bold'
                          : 'bg-white/60 text-slate-500 border-transparent hover:bg-white hover:text-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{partner}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Hidden Optional Field: Chauffeur (Multi Select) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsChauffeurSectionOpen(!isChauffeurSectionOpen)}
                className="w-full p-3.5 bg-slate-50/80 hover:bg-slate-100/70 transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isChauffeurSectionOpen ? 'rotate-180' : ''}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Chauffeur Filter
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal ml-2">
                      (Optional &bull; {selectedChauffeurs.length > 0 ? `${selectedChauffeurs.length} selected` : 'All eligible included'})
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-bold">
                  {isChauffeurSectionOpen ? 'Hide' : 'Expand'}
                </span>
              </button>

              {isChauffeurSectionOpen && (
                <div className="p-3.5 border-t border-slate-200 space-y-2.5 bg-white animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search chauffeur or vendor..."
                        value={chauffeurSearch}
                        onChange={(e) => setChauffeurSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white"
                      />
                    </div>
                    {selectedChauffeurs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedChauffeurs([])}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Reset ({selectedChauffeurs.length})
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 p-1 scrollbar-thin">
                    {filteredChauffeurOptions.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No chauffeurs found matching selected criteria.
                      </div>
                    ) : (
                      filteredChauffeurOptions.map((c) => {
                        const isSelected = selectedChauffeurs.includes(c.name);
                        return (
                          <div
                            key={c.name}
                            onClick={() => toggleChauffeur(c.name)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span>{c.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-sm">
                              {c.vendor}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-7 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* CTA: Run and see results */}
            <button
              type="button"
              disabled={isRunning || selectedPartners.length === 0}
              onClick={handleRunSimulation}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Simulating matching...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run and see results</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* POPUP 2: Simulation Results with same table as Allocation Leaderboard + CTA to send for approval */
        <div className="bg-white rounded-2xl max-w-[95vw] w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden text-slate-800">
          {/* Header */}
          <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('configure')}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Back to simulation configuration"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Manual Run Simulation Results
                  </h3>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
                    {model.version}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Live Simulation</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Service Date: <strong className="text-slate-700">{formattedDisplayDate}</strong></span>
                  <span>&bull;</span>
                  <span>Partners: <strong className="text-slate-700">{selectedPartners.join(', ')}</strong></span>
                  {selectedChauffeurs.length > 0 && (
                    <>
                      <span>&bull;</span>
                      <span>Chauffeurs: <strong className="text-slate-700">{selectedChauffeurs.length} selected</strong></span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 sm:px-6 bg-slate-50/40 border-b border-slate-200/80 shrink-0 text-xs">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                Simulated Matches
              </div>
              <div className="text-xl font-black font-mono text-slate-900">
                {simulatedResults.length} Bookings
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Total demand: ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                Avg Supply Score
              </div>
              <div className="text-xl font-black font-mono text-blue-600">
                {avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Calibrated quality index</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                Preferred Match Rate
              </div>
              <div className="text-xl font-black font-mono text-emerald-600">
                {preferredPct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Preferred tier chauffeur routing
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                Realized Net Margin
              </div>
              <div className="text-xl font-black font-mono text-emerald-700">
                ₹{totalActualMarginAmount.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-semibold text-slate-600">({blendedActualMarginPct}%)</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                Demand margin: ₹{totalDemandMarginAmount.toLocaleString('en-IN')} ({blendedDemandMarginPct}%)
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3 sm:px-6 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center p-0.5 bg-slate-200/70 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setResultsTagFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    resultsTagFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Tags
                </button>
                <button
                  onClick={() => setResultsTagFilter('VIP')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    resultsTagFilter === 'VIP' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>VIP</span>
                </button>
                <button
                  onClick={() => setResultsTagFilter('Normal')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    resultsTagFilter === 'Normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Normal
                </button>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Showing {simulatedResults.length} simulated matches
              </span>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search booking, chauffeur, vendor..."
                value={resultsSearch}
                onChange={(e) => setResultsSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-800 focus:outline-hidden focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Results Table: EXACT SAME TABLE STRUCTURE AS ALLOCATION LEADERBOARD */}
          <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[1980px] text-xs">
              {/* Top Multi-tier Section Header Bands */}
              <thead className="sticky top-0 z-20">
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider font-mono select-none">
                  {/* Demand Band: 8 cols */}
                  <th colSpan={8} className="py-2.5 px-4 bg-blue-50 text-blue-900 border-r border-blue-200">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      <span>DEMAND SECTION (BOOKING & BENEFIT)</span>
                    </div>
                  </th>

                  {/* Supply Band: 10 cols */}
                  <th colSpan={10} className="py-2.5 px-4 bg-emerald-50 text-emerald-950 border-r border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-emerald-700" />
                      <span>SUPPLY SECTION (CHAUFFEUR & PERFORMANCE ATTRIBUTION)</span>
                    </div>
                  </th>

                  {/* Actual Band: 5 cols (Sticky Right) */}
                  <th colSpan={5} className="sticky right-0 z-30 py-2.5 px-4 bg-[#ede2f7] text-purple-950 border-l-2 border-purple-300 shadow-[-6px_0_12px_rgba(0,0,0,0.06)] min-w-[570px] w-[570px]">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                        <span>ACTUAL OUTCOME & RECONCILIATION</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-200/90 text-purple-900 border border-purple-300">
                        Sticky Right
                      </span>
                    </div>
                  </th>
                </tr>

                {/* Column Level Headers */}
                <tr className="border-b border-slate-200/90 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  {/* 1. Demand Columns (8) */}
                  <th className="py-3 px-3.5">Booking ID</th>
                  <th className="py-3 px-3">Benefit Group</th>
                  <th className="py-3 px-3">Program</th>
                  <th className="py-3 px-3">Card Variant</th>
                  <th className="py-3 px-3 text-right">Revenue</th>
                  <th className="py-3 px-3 text-center">Tag</th>
                  <th className="py-3 px-3 text-right">Margin</th>
                  <th className="py-3 px-3.5 border-r border-slate-200">Service Date</th>

                  {/* 2. Supply Columns (10) */}
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-3.5">Chauffeur Name</th>
                  <th className="py-3 px-3">Vendor</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-3 text-center">Group</th>
                  <th className="py-3 px-3 text-right">Booking Completed</th>
                  <th className="py-3 px-3 text-right">On Time</th>
                  <th className="py-3 px-3 text-right">Happy Ratings</th>
                  <th className="py-3 px-3 text-center">Issues</th>
                  <th className="py-3 px-3.5 text-right border-r border-slate-200">Cost</th>

                  {/* 3. Actual Columns (5) - Sticky Right */}
                  <th className="sticky right-[420px] z-20 w-[150px] min-w-[150px] max-w-[150px] py-3 px-3 text-right bg-[#f3ebfa] text-purple-950 border-l-2 border-purple-200/90 shadow-[-6px_0_12px_rgba(0,0,0,0.06)] border-b border-slate-200/90">
                    Margin
                  </th>
                  <th className="sticky right-[330px] z-20 w-[90px] min-w-[90px] max-w-[90px] py-3 px-3 text-center bg-[#f3ebfa] text-purple-950 border-b border-slate-200/90">
                    CSAT
                  </th>
                  <th className="sticky right-[220px] z-20 w-[110px] min-w-[110px] max-w-[110px] py-3 px-3 text-center bg-[#f3ebfa] text-purple-950 border-b border-slate-200/90">
                    Score changed
                  </th>
                  <th className="sticky right-[110px] z-20 w-[110px] min-w-[110px] max-w-[110px] py-3 px-3 text-center bg-[#f3ebfa] text-purple-950 border-b border-slate-200/90">
                    Complaint (Y/N)
                  </th>
                  <th className="sticky right-0 z-20 w-[110px] min-w-[110px] max-w-[110px] py-3 px-3.5 text-center bg-[#f3ebfa] text-purple-950 border-b border-slate-200/90">
                    Warnings (Y/N)
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 text-slate-800 text-[12px]">
                {simulatedResults.length === 0 ? (
                  <tr>
                    <td colSpan={23} className="py-12 text-center text-slate-400 text-xs">
                      No simulation match records found for the selected partners and chauffeurs.
                    </td>
                  </tr>
                ) : (
                  simulatedResults.map((row) => {
                    const demandMarginAmount = Math.round(row.revenue * (row.margin / 100));
                    const actualMarginAmount = row.revenue - row.cost;
                    const rankTier = row.rankTier || (row.rank <= 3 ? 'Top 10' : row.rank <= 6 ? 'Top 25' : 'Top 50');
                    const totalWarnings = row.softWarning + row.criticalWarning;
                    const totalIssues = row.noShow + row.dsatRatings + row.fatalComplaints + totalWarnings;
                    const hasSevere = row.fatalComplaints > 0 || row.criticalWarning > 0 || row.noShow > 0;
                    const scoreChange = row.scoreChanged ?? 10;

                    return (
                      <tr key={row.id} className="group hover:bg-slate-50/70 transition-colors">
                        {/* Demand: Booking ID */}
                        <td className="py-3 px-3.5 font-mono font-bold text-blue-600 whitespace-nowrap">
                          {row.bookingId}
                        </td>

                        {/* Demand: Benefit Group */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                          {row.benefitGroup}
                        </td>

                        {/* Demand: Program */}
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900">
                          {row.program}
                        </td>

                        {/* Demand: Card Variant */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                          {row.cardVariant}
                        </td>

                        {/* Demand: Revenue */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ₹{row.revenue.toLocaleString('en-IN')}
                        </td>

                        {/* Demand: Tag */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {row.tag === 'VIP' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                              <Crown className="w-2.5 h-2.5 text-purple-600" />
                              VIP
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-medium uppercase tracking-wider">
                              Normal
                            </span>
                          )}
                        </td>

                        {/* Demand: Margin */}
                        <td className="py-3 px-3 text-right font-mono text-slate-800 whitespace-nowrap">
                          <span className="font-bold text-slate-900">₹{demandMarginAmount.toLocaleString('en-IN')}</span>{' '}
                          <span className="text-slate-500 font-medium">({row.margin.toFixed(1)}%)</span>
                        </td>

                        {/* Demand: Service Date */}
                        <td className="py-3 px-3.5 border-r border-slate-200 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {formattedDisplayDate}
                        </td>

                        {/* Supply: Rank (Top 10 / Top 25 / Top 50) */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                            rankTier === 'Top 10'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : rankTier === 'Top 25'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {rankTier}
                          </span>
                        </td>

                        {/* Supply: Chauffeur Name */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-bold text-slate-900">
                          {row.chauffeurName}
                        </td>

                        {/* Supply: Vendor */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                          {row.vendor}
                        </td>

                        {/* Supply: Score */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-black text-xs bg-blue-50 text-blue-700 border border-blue-200">
                            {row.score}
                          </span>
                        </td>

                        {/* Supply: Group */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {row.group === 'Preferred' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Preferred
                            </span>
                          ) : row.group === 'Excluded' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold">
                              <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                              Excluded
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-medium">
                              Standard
                            </span>
                          )}
                        </td>

                        {/* Supply: Booking Completed */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {row.bookingCompleted}
                        </td>

                        {/* Supply: On Time */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                          {row.onTime}%
                        </td>

                        {/* Supply: Happy Ratings */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                          {row.happyRatings}
                        </td>

                        {/* Supply: Issues with breakdown tooltip */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="relative inline-block group">
                            <button
                              type="button"
                              tabIndex={0}
                              className={`inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-md font-mono text-xs font-bold transition-all shadow-2xs cursor-help ${
                                totalIssues === 0
                                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                  : hasSevere
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                              }`}
                              aria-label={`Issues count: ${totalIssues}`}
                            >
                              {totalIssues}
                            </button>

                            {/* Floating breakdown tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus-within:block z-50 pointer-events-none">
                              <div className="bg-slate-900 text-white rounded-lg shadow-xl px-3 py-2 text-[11px] whitespace-nowrap border border-slate-700/80 min-w-[210px] text-left">
                                <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider">
                                  <span>Issues Breakdown</span>
                                  <span className={`font-bold ${totalIssues > 0 ? (hasSevere ? 'text-rose-400' : 'text-amber-400') : 'text-emerald-400'}`}>
                                    Total: {totalIssues}
                                  </span>
                                </div>
                                <div className="space-y-1 font-mono text-[11px]">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-slate-300">No show:</span>
                                    <span className={row.noShow > 0 ? 'font-bold text-rose-400' : 'text-slate-400'}>{row.noShow}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-slate-300">DSAT:</span>
                                    <span className={row.dsatRatings > 0 ? 'font-bold text-amber-300' : 'text-slate-400'}>{row.dsatRatings}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-slate-300">Fatal Complaints:</span>
                                    <span className={row.fatalComplaints > 0 ? 'font-bold text-rose-400' : 'text-slate-400'}>{row.fatalComplaints}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-slate-300">Warnings:</span>
                                    <span className={totalWarnings > 0 ? 'font-bold text-amber-300' : 'text-slate-400'}>
                                      {totalWarnings}
                                      {totalWarnings > 0 && (
                                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                                          ({row.softWarning} soft, {row.criticalWarning} crit)
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Supply: Cost */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                          ₹{row.cost.toLocaleString('en-IN')}
                        </td>

                        {/* Actual: Margin - Sticky Right */}
                        <td className="sticky right-[420px] z-10 w-[150px] min-w-[150px] max-w-[150px] py-3 px-3 text-right font-mono whitespace-nowrap bg-[#faf6fe] group-hover:bg-[#f0e6fa] border-l-2 border-purple-200/90 shadow-[-6px_0_12px_rgba(0,0,0,0.06)] transition-colors">
                          <span className="font-bold text-emerald-700">₹{actualMarginAmount.toLocaleString('en-IN')}</span>{' '}
                          <span className="text-slate-600 font-semibold">({row.actualMargin.toFixed(1)}%)</span>
                        </td>

                        {/* Actual: CSAT - Sticky Right */}
                        <td className="sticky right-[330px] z-10 w-[90px] min-w-[90px] max-w-[90px] py-3 px-3 text-center whitespace-nowrap bg-[#faf6fe] group-hover:bg-[#f0e6fa] transition-colors">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-xs border ${
                            row.actualCsat >= 4.5 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {row.actualCsat.toFixed(1)}
                          </span>
                        </td>

                        {/* Actual: Score changed (in bracket in green color) - Sticky Right */}
                        <td className="sticky right-[220px] z-10 w-[110px] min-w-[110px] max-w-[110px] py-3 px-3 text-center whitespace-nowrap bg-[#faf6fe] group-hover:bg-[#f0e6fa] transition-colors">
                          <span className="font-mono font-bold text-xs text-emerald-600">
                            (+{scoreChange})
                          </span>
                        </td>

                        {/* Actual: Complaint (Y/N) - Sticky Right */}
                        <td className="sticky right-[110px] z-10 w-[110px] min-w-[110px] max-w-[110px] py-3 px-3 text-center whitespace-nowrap bg-[#faf6fe] group-hover:bg-[#f0e6fa] transition-colors">
                          {row.hasComplaint ? (
                            <span className="inline-flex items-center justify-center w-6 h-5 rounded font-mono font-bold text-[11px] bg-rose-100 text-rose-700 border border-rose-200">
                              Y
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-5 rounded font-mono font-bold text-[11px] bg-emerald-100 text-emerald-700 border border-emerald-200">
                              N
                            </span>
                          )}
                        </td>

                        {/* Actual: Warnings (Y/N) - Sticky Right */}
                        <td className="sticky right-0 z-10 w-[110px] min-w-[110px] max-w-[110px] py-3 px-3.5 text-center whitespace-nowrap bg-[#faf6fe] group-hover:bg-[#f0e6fa] transition-colors">
                          {row.hasWarnings ? (
                            <span className="inline-flex items-center justify-center w-6 h-5 rounded font-mono font-bold text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                              Y
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-600 border border-slate-200">
                              N
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Footer Summary Row */}
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100/95 font-bold text-[12px] text-slate-900">
                  <td className="py-3 px-3.5" colSpan={4}>
                    <span>Simulation Blended Summary ({simulatedResults.length} Bookings)</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-[10px]">
                    {simulatedResults.filter((c) => c.tag === 'VIP').length} VIP
                  </td>
                  <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                    <span className="font-bold text-slate-900">₹{totalDemandMarginAmount.toLocaleString('en-IN')}</span>{' '}
                    <span className="text-slate-600">({blendedDemandMarginPct}%)</span>
                  </td>
                  <td className="py-3 px-3.5 border-r border-slate-300 text-slate-500 font-mono text-[10px]">
                    {formattedDisplayDate}
                  </td>

                  {/* Supply Footer */}
                  <td className="py-3 px-3 text-center font-mono text-slate-500">-</td>
                  <td className="py-3 px-3.5 text-slate-700">{simulatedResults.length} Chauffeurs</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">
                    {selectedPartners.length === 1 ? selectedPartners[0] : `${selectedPartners.length} Partners`}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-blue-700">{avgScore}</td>
                  <td className="py-3 px-3 text-center font-mono text-[10px] text-emerald-700">{preferredPct}% Pref</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {simulatedResults.reduce((acc, c) => acc + c.bookingCompleted, 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700">
                    {(simulatedResults.reduce((acc, c) => acc + c.onTime, 0) / (simulatedResults.length || 1)).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700">
                    {simulatedResults.reduce((acc, c) => acc + c.happyRatings, 0)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-800">
                    {totalIssuesCount} Issues
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-black text-slate-900 border-r border-slate-300">
                    ₹{totalCost.toLocaleString('en-IN')}
                  </td>

                  {/* Actual Margin Total - Sticky Right */}
                  <td className="sticky right-[420px] z-10 w-[150px] min-w-[150px] max-w-[150px] py-3.5 px-3 text-right font-mono whitespace-nowrap bg-[#ede2f7] border-l-2 border-purple-300 shadow-[-6px_0_12px_rgba(0,0,0,0.06)]">
                    <span className="font-black text-emerald-700">₹{totalActualMarginAmount.toLocaleString('en-IN')}</span>{' '}
                    <span className="text-emerald-800">({blendedActualMarginPct}%)</span>
                  </td>
                  <td className="sticky right-[330px] z-10 w-[90px] min-w-[90px] max-w-[90px] py-3.5 px-3 text-center font-mono text-emerald-700 bg-[#ede2f7]">
                    {(simulatedResults.reduce((acc, c) => acc + c.actualCsat, 0) / (simulatedResults.length || 1)).toFixed(1)}
                  </td>
                  {/* Score changed footer - Sticky Right */}
                  <td className="sticky right-[220px] z-10 w-[110px] min-w-[110px] max-w-[110px] py-3.5 px-3 text-center font-mono text-emerald-600 font-bold bg-[#ede2f7]">
                    (+{avgScoreChange})
                  </td>
                  <td className="sticky right-[110px] z-10 w-[110px] min-w-[110px] max-w-[110px] py-3.5 px-3 text-center font-mono text-rose-700 bg-[#ede2f7]">
                    {simulatedResults.filter((c) => c.hasComplaint).length} Y
                  </td>
                  <td className="sticky right-0 z-10 w-[110px] min-w-[110px] max-w-[110px] py-3.5 px-3.5 text-center font-mono text-amber-700 bg-[#ede2f7]">
                    {simulatedResults.filter((c) => c.hasWarnings).length} Y
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Action Footer: Back / Close and CTA TO SEND FOR APPROVAL */}
          <div className="p-3.5 sm:px-6 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Adjust Parameters</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              {/* PRIMARY CTA: Send for approval */}
              <button
                type="button"
                onClick={handleSendForApproval}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send for approval</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
