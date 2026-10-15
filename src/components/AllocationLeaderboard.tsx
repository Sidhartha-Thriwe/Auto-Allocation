import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Trophy, 
  Users, 
  Crown, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Star, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Filter,
  CreditCard,
  Building2,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Settings
} from 'lucide-react';
import { ALLOCATION_MATCH_DATA } from '../data';
import { AllocationMatchItem } from '../types';

interface AllocationLeaderboardProps {
  onBackToDashboard: () => void;
  onOpenModelListing?: () => void;
}

// Single day options
export interface SingleDayOption {
  key: string;
  label: string;
  displayDate: string;
  matchStr: string;
  isoDate: string;
}

const SINGLE_DAY_OPTIONS: SingleDayOption[] = [
  { key: 'Today', label: 'Today', displayDate: 'Today (07 Oct 2026)', matchStr: '07 Oct 2026', isoDate: '2026-10-07' },
  { key: 'Yesterday', label: 'Yesterday', displayDate: 'Yesterday (06 Oct 2026)', matchStr: '06 Oct 2026', isoDate: '2026-10-06' },
  { key: '05 Oct 2026', label: '05 Oct 2026', displayDate: '05 Oct 2026', matchStr: '05 Oct 2026', isoDate: '2026-10-05' },
];

export const AllocationLeaderboard: React.FC<AllocationLeaderboardProps> = ({
  onBackToDashboard,
  onOpenModelListing,
}) => {
  const [data] = useState<AllocationMatchItem[]>(ALLOCATION_MATCH_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<'all' | 'VIP' | 'Normal'>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | 'Preferred' | 'Standard' | 'Excluded'>('all');
  
  // Single Day Date Filter (Default: 'Today')
  const [dateFilter, setDateFilter] = useState<string>('Today');
  const [customIsoDate, setCustomIsoDate] = useState<string>('2026-10-07');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Program & Vendor filters
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');

  // Pagination (20 rows per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Unique programs and vendors
  const programOptions = useMemo(() => {
    const list = Array.from(new Set(data.map((d) => d.program))).sort();
    return ['all', ...list];
  }, [data]);

  const vendorOptions = useMemo(() => {
    const list = Array.from(new Set(data.map((d) => d.vendor))).sort();
    return ['all', ...list];
  }, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Single Day Date filter
      if (dateFilter === 'Today') {
        if (!item.serviceDate.includes('07 Oct 2026')) return false;
      } else if (dateFilter === 'Yesterday') {
        if (!item.serviceDate.includes('06 Oct 2026')) return false;
      } else if (dateFilter !== 'All Dates') {
        if (!item.serviceDate.includes(dateFilter)) return false;
      }
      
      // Tag filter
      if (tagFilter !== 'all' && item.tag !== tagFilter) return false;

      // Supply group filter
      if (groupFilter !== 'all' && item.group !== groupFilter) return false;

      // Program filter
      if (programFilter !== 'all' && item.program !== programFilter) return false;

      // Vendor filter
      if (vendorFilter !== 'all' && item.vendor !== vendorFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          item.bookingId.toLowerCase().includes(q) ||
          item.chauffeurName.toLowerCase().includes(q) ||
          item.vendor.toLowerCase().includes(q) ||
          item.program.toLowerCase().includes(q) ||
          item.cardVariant.toLowerCase().includes(q) ||
          item.benefitGroup.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [data, dateFilter, tagFilter, groupFilter, programFilter, vendorFilter, searchQuery]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, tagFilter, groupFilter, programFilter, vendorFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // KPI calculations
  const totalRevenue = filteredData.reduce((acc, c) => acc + c.revenue, 0);
  const totalCost = filteredData.reduce((acc, c) => acc + c.cost, 0);
  const totalDemandMarginAmount = filteredData.reduce((acc, c) => acc + Math.round(c.revenue * (c.margin / 100)), 0);
  const totalActualMarginAmount = totalRevenue - totalCost;

  const blendedDemandMarginPct = totalRevenue > 0
    ? ((totalDemandMarginAmount / totalRevenue) * 100).toFixed(1)
    : '0';

  const blendedActualMarginPct = totalRevenue > 0 
    ? ((totalActualMarginAmount / totalRevenue) * 100).toFixed(1)
    : '0';

  const avgScore = filteredData.length > 0
    ? (filteredData.reduce((acc, c) => acc + c.score, 0) / filteredData.length).toFixed(1)
    : '0';
  const preferredPct = filteredData.length > 0
    ? ((filteredData.filter((c) => c.group === 'Preferred').length / filteredData.length) * 100).toFixed(1)
    : '0';

  const avgScoreChange = filteredData.length > 0
    ? Math.round(filteredData.reduce((acc, c) => acc + (c.scoreChanged ?? 10), 0) / filteredData.length)
    : 10;

  const totalIssuesCount = filteredData.reduce(
    (acc, c) => acc + c.noShow + c.dsatRatings + c.fatalComplaints + c.softWarning + c.criticalWarning,
    0
  );

  // Active display label for current date
  const displayDateLabel = useMemo(() => {
    if (dateFilter === 'Today') return 'Today (07 Oct 2026)';
    if (dateFilter === 'Yesterday') return 'Yesterday (06 Oct 2026)';
    if (dateFilter === 'All Dates') return 'All Dates';
    return dateFilter;
  }, [dateFilter]);

  const handleSelectDay = (key: string) => {
    setDateFilter(key);
    setIsDateDropdownOpen(false);
  };

  const handleCustomDateSelect = (isoStr: string) => {
    setCustomIsoDate(isoStr);
    if (!isoStr) return;
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const formatted = `${day} ${monthNames[monthIdx] || parts[1]} ${year}`;
      setDateFilter(formatted);
      setIsDateDropdownOpen(false);
    }
  };

  const goToPreviousDay = () => {
    if (dateFilter === 'Today') {
      setDateFilter('Yesterday');
    } else if (dateFilter === 'Yesterday') {
      setDateFilter('05 Oct 2026');
    } else if (dateFilter === '05 Oct 2026') {
      setDateFilter('04 Oct 2026');
    } else {
      setDateFilter('Yesterday');
    }
  };

  const goToNextDay = () => {
    if (dateFilter === '05 Oct 2026' || dateFilter === '04 Oct 2026') {
      setDateFilter('Yesterday');
    } else if (dateFilter === 'Yesterday') {
      setDateFilter('Today');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Booking ID', 'Benefit Group', 'Program', 'Card Variant', 'Revenue', 'Tag', 'Demand Margin (INR)', 'Demand Margin (%)', 'Service Date',
      'Rank', 'Chauffeur Name', 'Vendor', 'Score', 'Group', 'Booking Completed', 'On Time %', 'Happy Ratings', 'Issues', 'Cost',
      'Actual Margin (INR)', 'Actual Margin (%)', 'Actual CSAT', 'Score changed', 'Complaint', 'Warnings'
    ];
    
    const rows = filteredData.map((d) => {
      const demandMarginVal = Math.round(d.revenue * (d.margin / 100));
      const actualMarginVal = d.revenue - d.cost;
      const rankTier = d.rankTier || (d.rank <= 3 ? 'Top 10' : d.rank <= 6 ? 'Top 25' : 'Top 50');
      const totalIssues = d.noShow + d.dsatRatings + d.fatalComplaints + d.softWarning + d.criticalWarning;
      const scoreChangeDisplay = `(+${d.scoreChanged ?? 10})`;
      return [
        d.bookingId, d.benefitGroup, d.program, d.cardVariant, d.revenue, d.tag, demandMarginVal, `${d.margin}%`, d.serviceDate,
        rankTier, d.chauffeurName, d.vendor, d.score, d.group, d.bookingCompleted, d.onTime, d.happyRatings, totalIssues, d.cost,
        actualMarginVal, `${d.actualMargin}%`, d.actualCsat, scoreChangeDisplay, d.hasComplaint ? 'Y' : 'N', d.hasWarnings ? 'Y' : 'N'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `allocation_leaderboard_${dateFilter.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllFilters = () => {
    setDateFilter('Today');
    setTagFilter('all');
    setGroupFilter('all');
    setProgramFilter('all');
    setVendorFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = dateFilter !== 'Today' || tagFilter !== 'all' || groupFilter !== 'all' || programFilter !== 'all' || vendorFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1780px] mx-auto space-y-5">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <button 
              onClick={onBackToDashboard} 
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Allocation Leaderboard</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Allocation Leaderboard
              </h1>
            </div>
          </div>
        </div>

        {/* Action buttons with Single Day Date Filter before Export CSV */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Single Day Date Filter with Quick Steppers */}
          <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={goToPreviousDay}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className="inline-flex items-center gap-2 px-2.5 py-1 text-slate-800 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Date: <span className="text-blue-700 font-bold">{displayDateLabel}</span></span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDateDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Select Single Day
                  </div>
                  
                  <div className="py-1">
                    {SINGLE_DAY_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectDay(opt.key)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          dateFilter === opt.key ? 'font-bold text-blue-700 bg-blue-50/70' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{opt.label}</span>
                          {opt.key === 'Today' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-blue-100 text-blue-700 font-bold">
                              Default
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">({opt.matchStr})</span>
                        </div>
                        {dateFilter === opt.key && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}

                    <button
                      onClick={() => handleSelectDay('All Dates')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        dateFilter === 'All Dates' ? 'font-bold text-blue-700 bg-blue-50/70' : 'text-slate-700'
                      }`}
                    >
                      <span>All Dates (All Bookings)</span>
                      {dateFilter === 'All Dates' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  </div>

                  {/* Custom Single Day Picker */}
                  <div className="px-3 pt-2 pb-1 border-t border-slate-100">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Or Pick Specific Day
                    </label>
                    <input
                      type="date"
                      value={customIsoDate}
                      onChange={(e) => handleCustomDateSelect(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={goToNextDay}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export CSV CTA */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          {/* Back Button */}
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* Setting Icon CTA next to Dashboard and Export CSV -> Model Listing */}
          <button
            onClick={onOpenModelListing}
            className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer group"
            title="Model Listing & Configurations"
            aria-label="Model Listing"
          >
            <Settings className="w-4 h-4 text-slate-600 group-hover:rotate-45 group-hover:text-blue-600 transition-all" />
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Total Demand Value
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{filteredData.length} Matched Bookings ({displayDateLabel})</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Avg Supply Score
          </div>
          <div className="text-2xl font-black font-mono text-blue-600">
            {avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Top Tier Quality Index</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Preferred Match Rate
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600">
            {preferredPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chauffeurs from preferred tier
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Realized Net Margin
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700">
            ₹{totalActualMarginAmount.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-semibold text-slate-600">({blendedActualMarginPct}%)</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Demand baseline: ₹{totalDemandMarginAmount.toLocaleString('en-IN')} ({blendedDemandMarginPct}%)</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Filter Controls Bar: Program, Vendor, Tag, Supply Group & Search */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-slate-50/60">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Program Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Program:</span>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 shadow-2xs focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              >
                <option value="all">All Programs ({programOptions.length - 1})</option>
                {programOptions.filter(p => p !== 'all').map((prog) => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            {/* Vendor Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Vendor:</span>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 shadow-2xs focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              >
                <option value="all">All Vendors ({vendorOptions.length - 1})</option>
                {vendorOptions.filter(v => v !== 'all').map((ven) => (
                  <option key={ven} value={ven}>{ven}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter Segmented Controls */}
            <div className="inline-flex items-center p-0.5 bg-slate-200/70 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setTagFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  tagFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Tags
              </button>
              <button
                onClick={() => setTagFilter('VIP')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  tagFilter === 'VIP' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>VIP</span>
              </button>
              <button
                onClick={() => setTagFilter('Normal')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  tagFilter === 'Normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Normal
              </button>
            </div>

            {/* Supply Group Filter */}
            <div className="inline-flex items-center p-0.5 bg-slate-200/70 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setGroupFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  groupFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Groups
              </button>
              <button
                onClick={() => setGroupFilter('Preferred')}
                className={`px-2.5 py-1 rounded-md transition-all text-emerald-700 ${
                  groupFilter === 'Preferred' ? 'bg-white shadow-xs font-bold' : 'hover:text-emerald-900'
                }`}
              >
                Preferred
              </button>
              <button
                onClick={() => setGroupFilter('Standard')}
                className={`px-2.5 py-1 rounded-md transition-all text-blue-700 ${
                  groupFilter === 'Standard' ? 'bg-white shadow-xs font-bold' : 'hover:text-blue-900'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setGroupFilter('Excluded')}
                className={`px-2.5 py-1 rounded-md transition-all text-rose-700 ${
                  groupFilter === 'Excluded' ? 'bg-white shadow-xs font-bold' : 'hover:text-rose-900'
                }`}
              >
                Excluded
              </button>
            </div>

            {/* Reset Filter Button if active */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-2xs transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Booking, Chauffeur, Vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-800 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30"
            />
          </div>
        </div>

        {/* Responsive Horizontal Scroll Table */}
        <div className="overflow-x-auto max-h-[720px] scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[1980px] text-xs">
            {/* Top Multi-tier Section Header Bands */}
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider font-mono select-none">
                {/* Demand Band: 8 cols */}
                <th colSpan={8} className="py-2.5 px-4 bg-blue-50/80 text-blue-900 border-r border-blue-200">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>DEMAND SECTION (BOOKING & BENEFIT)</span>
                  </div>
                </th>

                {/* Supply Band: 10 cols */}
                <th colSpan={10} className="py-2.5 px-4 bg-emerald-50/80 text-emerald-950 border-r border-emerald-200">
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
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={23} className="py-12 text-center text-slate-400 text-xs">
                    No demand vs supply match records found for the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
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

                      {/* Demand: Margin (Number and % in bracket) */}
                      <td className="py-3 px-3 text-right font-mono text-slate-800 whitespace-nowrap">
                        <span className="font-bold text-slate-900">₹{demandMarginAmount.toLocaleString('en-IN')}</span>{' '}
                        <span className="text-slate-500 font-medium">({row.margin.toFixed(1)}%)</span>
                      </td>

                      {/* Demand: Service Date */}
                      <td className="py-3 px-3.5 border-r border-slate-200 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                        {row.serviceDate}
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

                      {/* Supply: Issues (Single count with interactive hover breakup tooltip) */}
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
                              {/* Tooltip caret */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Supply: Cost */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                        ₹{row.cost.toLocaleString('en-IN')}
                      </td>

                      {/* Actual: Margin (Number and % in bracket) - Sticky Right */}
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
                <td className="py-3.5 px-3.5" colSpan={4}>
                  <span>Total / Blended Summary ({filteredData.length} Rows across {totalPages} Pages)</span>
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-3 text-center font-mono text-[10px]">
                  {filteredData.filter((c) => c.tag === 'VIP').length} VIP
                </td>
                {/* Demand Margin Total in Number and % in bracket */}
                <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                  <span className="font-bold text-slate-900">₹{totalDemandMarginAmount.toLocaleString('en-IN')}</span>{' '}
                  <span className="text-slate-600">({blendedDemandMarginPct}%)</span>
                </td>
                <td className="py-3.5 px-3.5 border-r border-slate-300 text-slate-500 font-mono text-[10px]">
                  {dateFilter}
                </td>

                {/* Supply Footer */}
                <td className="py-3.5 px-3 text-center font-mono text-slate-500">-</td>
                <td className="py-3.5 px-3.5 text-slate-700">{filteredData.length} Chauffeurs</td>
                <td className="py-3.5 px-3 text-slate-500 font-mono text-[10px]">{vendorFilter === 'all' ? 'Multi-Vendor' : vendorFilter}</td>
                <td className="py-3.5 px-3 text-center font-mono text-blue-700">{avgScore}</td>
                <td className="py-3.5 px-3 text-center font-mono text-[10px] text-emerald-700">{preferredPct}% Pref</td>
                <td className="py-3.5 px-3 text-right font-mono">
                  {filteredData.reduce((acc, c) => acc + c.bookingCompleted, 0)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-emerald-700">
                  {(filteredData.reduce((acc, c) => acc + c.onTime, 0) / (filteredData.length || 1)).toFixed(1)}%
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-emerald-700">
                  {filteredData.reduce((acc, c) => acc + c.happyRatings, 0)}
                </td>
                <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-800">
                  {totalIssuesCount} Issues
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono font-black text-slate-900 border-r border-slate-300">
                  ₹{totalCost.toLocaleString('en-IN')}
                </td>

                {/* Actual Margin Total in Number and % in bracket - Sticky Right */}
                <td className="sticky right-[420px] z-10 w-[150px] min-w-[150px] max-w-[150px] py-3.5 px-3 text-right font-mono whitespace-nowrap bg-[#ede2f7] border-l-2 border-purple-300 shadow-[-6px_0_12px_rgba(0,0,0,0.06)]">
                  <span className="font-black text-emerald-700">₹{totalActualMarginAmount.toLocaleString('en-IN')}</span>{' '}
                  <span className="text-emerald-800">({blendedActualMarginPct}%)</span>
                </td>
                <td className="sticky right-[330px] z-10 w-[90px] min-w-[90px] max-w-[90px] py-3.5 px-3 text-center font-mono text-emerald-700 bg-[#ede2f7]">
                  {(filteredData.reduce((acc, c) => acc + c.actualCsat, 0) / (filteredData.length || 1)).toFixed(1)}
                </td>
                {/* Score changed footer - Sticky Right */}
                <td className="sticky right-[220px] z-10 w-[110px] min-w-[110px] max-w-[110px] py-3.5 px-3 text-center font-mono text-emerald-600 font-bold bg-[#ede2f7]">
                  (+{avgScoreChange})
                </td>
                <td className="sticky right-[110px] z-10 w-[110px] min-w-[110px] max-w-[110px] py-3.5 px-3 text-center font-mono text-rose-700 bg-[#ede2f7]">
                  {filteredData.filter((c) => c.hasComplaint).length} Y
                </td>
                <td className="sticky right-0 z-10 w-[110px] min-w-[110px] max-w-[110px] py-3.5 px-3.5 text-center font-mono text-amber-700 bg-[#ede2f7]">
                  {filteredData.filter((c) => c.hasWarnings).length} Y
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Controls Bar: 20 rows per page */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-mono">
            {filteredData.length === 0 ? (
              <span>Showing 0 of 0 allocations</span>
            ) : (
              <span>
                Showing <strong className="text-slate-900 font-bold">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-900 font-bold">{Math.min(currentPage * pageSize, filteredData.length)}</strong> of{' '}
                <strong className="text-slate-900 font-bold">{filteredData.length}</strong> allocations (20 per page)
              </span>
            )}
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || filteredData.length === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                // Show condensed page numbers if totalPages > 6
                if (totalPages > 6 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                  if (p === 2 || p === totalPages - 1) {
                    return <span key={p} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || filteredData.length === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
