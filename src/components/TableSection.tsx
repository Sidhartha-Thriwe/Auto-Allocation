import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  Search, 
  ArrowUpDown,
  Star,
  Users,
  CheckCircle2,
  AlertCircle,
  Info,
  Car,
  Sparkles
} from 'lucide-react';
import { DashboardItem, DashboardTab, FilterStatus, DateRangeOption, DateFilterSelection, PeriodDayInfo } from '../types';
import { getSectionDays } from '../utils/dateFilterUtils';
import { ChauffeurRankTimeline } from './ChauffeurRankTimeline';

interface TableSectionProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  partnerData: DashboardItem[];
  programData: DashboardItem[];
  chauffeurData?: DashboardItem[];
  dateRange?: DateRangeOption;
  dateSelection?: DateFilterSelection;
  onSelectItem?: (item: DashboardItem) => void;
}

export const TableSection: React.FC<TableSectionProps> = ({
  currentTab,
  onTabChange,
  partnerData,
  programData,
  chauffeurData = [],
  dateRange = 'this_week',
  dateSelection,
  onSelectItem,
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof DashboardItem | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  // Active dataset
  const activeDataset = useMemo(() => {
    switch (currentTab) {
      case 'chauffeurs':
        return chauffeurData;
      case 'program':
        return programData;
      case 'partners':
      default:
        return partnerData;
    }
  }, [currentTab, partnerData, programData, chauffeurData]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return activeDataset.filter((item) => {
      // Performance filter
      const fulfillmentRate = item.totalBookings > 0 ? (item.bookingFulfilled / item.totalBookings) * 100 : 0;
      if (filterStatus === 'high_performance' && fulfillmentRate < 70) return false;
      if (filterStatus === 'needs_attention' && fulfillmentRate >= 70) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSubtitle = item.subTitle?.toLowerCase().includes(q);
        const matchPartner = item.partnerName?.toLowerCase().includes(q);
        const matchTag = item.tag?.toLowerCase().includes(q);
        if (!matchName && !matchSubtitle && !matchPartner && !matchTag) return false;
      }

      return true;
    });
  }, [activeDataset, filterStatus, searchQuery]);

  // Sorted dataset
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredData, sortField, sortAsc]);

  const handleSort = (field: keyof DashboardItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for metrics
    }
  };

  // Aggregated totals
  const totalCount = sortedData.length;
  const totalEligible = sortedData.reduce((acc, c) => acc + (c.eligibleChauffeurs ?? 0), 0);
  const totalExpected = sortedData.reduce((acc, c) => acc + (c.chauffeursExpected ?? 0), 0);
  const totalBelow = sortedData.reduce((acc, c) => acc + (c.chauffeursBelowExpectation ?? 0), 0);
  const totalPointsAtBeginning = sortedData.reduce((acc, c) => acc + (c.pointsAtBeginning ?? 0), 0);
  const totalPointsGained = sortedData.reduce((acc, c) => acc + (c.pointsGained ?? 0), 0);
  const totalBookings = sortedData.reduce((acc, c) => acc + c.totalBookings, 0);
  const totalAllocated = sortedData.reduce((acc, c) => acc + c.bookingsAllocated, 0);
  const totalAccepted = sortedData.reduce((acc, c) => acc + c.bookingsAccepted, 0);
  const totalFulfilled = sortedData.reduce((acc, c) => acc + c.bookingFulfilled, 0);
  const totalFulfilledOnTime = sortedData.reduce((acc, c) => acc + c.bookingFulfilledOnTime, 0);
  const totalComplaints = sortedData.reduce((acc, c) => acc + c.complaints, 0);

  const totalAllocatedPct = totalBookings > 0 ? ((totalAllocated / totalBookings) * 100).toFixed(1) : '0';
  const totalAcceptedPct = totalAllocated > 0 ? ((totalAccepted / totalAllocated) * 100).toFixed(1) : '0';
  const totalFulfilledPct = totalBookings > 0 ? ((totalFulfilled / totalBookings) * 100).toFixed(1) : '0';
  const totalOnTimePct = totalFulfilled > 0 ? ((totalFulfilledOnTime / totalFulfilled) * 100).toFixed(1) : '0';

  // Sub-totals for secondary values
  const totalAutoFulfilled = Math.round(totalFulfilled * 0.912);
  const totalAutoFulfilledPct = totalFulfilled > 0 ? ((totalAutoFulfilled / totalFulfilled) * 100).toFixed(1) : '0';

  const totalAutoFulfilledOnTime = Math.round(totalFulfilledOnTime * 0.934);
  const totalAutoOnTimePct = totalFulfilledOnTime > 0 ? ((totalAutoFulfilledOnTime / totalFulfilledOnTime) * 100).toFixed(1) : '0';

  const totalAutoComplaints = Math.round(totalComplaints * 0.216);
  const totalAutoComplaintsPct = totalComplaints > 0 ? ((totalAutoComplaints / totalComplaints) * 100).toFixed(1) : '0';

  const avgCsat = totalCount > 0 
    ? (sortedData.reduce((acc, c) => acc + (typeof c.csat === 'number' ? c.csat : 4.5), 0) / totalCount).toFixed(1)
    : '4.7';

  // Period date ranges for Preceding, In focus, and Upcoming sections
  const periods = useMemo(() => {
    if (dateSelection) {
      return {
        preceding: dateSelection.precedingRange,
        inFocus: dateSelection.inFocusRange,
        upcoming: dateSelection.upcomingRange,
      };
    }
    switch (dateRange) {
      case 'today':
        return {
          preceding: 'Oct 6, 2026',
          inFocus: 'Oct 7, 2026',
          upcoming: 'Oct 8, 2026',
        };
      case 'last_7_days':
        return {
          preceding: 'Sep 23 - Sep 29, 2026',
          inFocus: 'Sep 30 - Oct 7, 2026',
          upcoming: 'Oct 8 - Oct 14, 2026',
        };
      case 'this_month':
        return {
          preceding: 'Sep 1 - Sep 30, 2026',
          inFocus: 'Oct 1 - Oct 31, 2026',
          upcoming: 'Nov 1 - Nov 30, 2026',
        };
      case 'quarter_to_date':
        return {
          preceding: 'Q3 (Jul - Sep 2026)',
          inFocus: 'Q4 (Oct - Dec 2026)',
          upcoming: 'Q1 (Jan - Mar 2027)',
        };
      case 'this_week':
      case 'custom':
      default:
        return {
          preceding: 'Sep 24 - Sep 30, 2026',
          inFocus: 'Oct 1 - Oct 7, 2026',
          upcoming: 'Oct 8 - Oct 14, 2026',
        };
    }
  }, [dateSelection, dateRange]);

  // Daily breakdowns for Chauffeur tab under each of the 3 sections (7 days for week)
  const { section1Days, section2Days, section3Days } = useMemo(() => {
    return getSectionDays(dateSelection);
  }, [dateSelection]);

  // Section totals for Chauffeur tab
  const totalPrecedingRec = useMemo(() => 
    sortedData.reduce((acc, c) => acc + (c.precedingPeriod?.bookingsRecommended ?? 20), 0)
  , [sortedData]);
  const totalPrecedingFul = useMemo(() => 
    sortedData.reduce((acc, c) => acc + (c.precedingPeriod?.bookingsFulfilled ?? 15), 0)
  , [sortedData]);
  const totalPrecedingPct = totalPrecedingRec > 0 ? Math.round((totalPrecedingFul / totalPrecedingRec) * 100) : 0;

  const totalInFocusRec = useMemo(() => 
    sortedData.reduce((acc, c) => acc + (c.inFocusPeriod?.bookingsRecommended ?? 22), 0)
  , [sortedData]);
  const totalInFocusFul = useMemo(() => 
    sortedData.reduce((acc, c) => acc + (c.inFocusPeriod?.bookingsFulfilled ?? 18), 0)
  , [sortedData]);
  const totalInFocusPct = totalInFocusRec > 0 ? Math.round((totalInFocusFul / totalInFocusRec) * 100) : 0;

  const totalUpcomingRec = useMemo(() => 
    sortedData.reduce((acc, c) => acc + (c.upcomingPeriod?.bookingsRecommended ?? 24), 0)
  , [sortedData]);
  const totalUpcomingFul = useMemo(() => 
    sortedData.reduce((acc, c) => acc + (c.upcomingPeriod?.bookingsFulfilled ?? 19), 0)
  , [sortedData]);
  const totalUpcomingPct = totalUpcomingRec > 0 ? Math.round((totalUpcomingFul / totalUpcomingRec) * 100) : 0;

  const getFirstColumnHeader = () => {
    switch (currentTab) {
      case 'chauffeurs':
        return 'CHAUFFEUR';
      case 'program':
        return 'PROGRAM';
      case 'partners':
      default:
        return 'PARTNER';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Filter and Tab Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-200/80 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Left Segmented Tab Group: By Partners, By Program, By Chauffeur */}
        <div className="bg-[#f1f5f9] p-1 rounded-lg inline-flex items-center gap-0.5 overflow-x-auto max-w-full">
          {/* Tab 1: By Partners */}
          <button
            onClick={() => onTabChange('partners')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'partners'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600 stroke-[2]" />
            <span>By Partners</span>
            <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[11px] font-mono font-medium">
              {partnerData.length}
            </span>
          </button>

          {/* Tab 2: By Program */}
          <button
            onClick={() => onTabChange('program')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'program'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-600 stroke-[2]" />
            <span>By Program</span>
            <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[11px] font-mono font-medium">
              {programData.length}
            </span>
          </button>

          {/* Tab 3: By Chauffeur */}
          <button
            onClick={() => onTabChange('chauffeurs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'chauffeurs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
            <span>By Chauffeur</span>
            <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[11px] font-mono font-medium">
              {chauffeurData.length}
            </span>
          </button>
        </div>

        {/* Right Controls: Filter status + Search */}
        <div className="flex flex-wrap items-center gap-3 justify-between xl:justify-end">
          {/* Status Filter buttons */}
          <div className="inline-flex items-center gap-1 text-xs text-slate-600">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Rows ({activeDataset.length})
            </button>
            <button
              onClick={() => setFilterStatus('high_performance')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterStatus === 'high_performance'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              High Fulfillment (&gt;70%)
            </button>
            <button
              onClick={() => setFilterStatus('needs_attention')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterStatus === 'needs_attention'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Needs Attention
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[180px] sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Filter ${currentTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200/90 rounded-md placeholder:text-slate-400 text-slate-800 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30"
            />
          </div>
        </div>
      </div>

      {/* By Chauffeur: rank timeline (replaces table) */}
      {currentTab === 'chauffeurs' ? (
        <ChauffeurRankTimeline
          items={sortedData}
          sections={[
            { key: 'section1', label: periods.preceding, days: section1Days },
            { key: 'section2', label: periods.inFocus, days: section2Days },
            { key: 'section3', label: periods.upcoming, days: section3Days },
          ]}
          monthStart={dateSelection?.granularity === 'month' ? dateSelection.startDate : undefined}
        />
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1150px]">
          <thead>
              <tr className="border-b border-slate-200/90 bg-white text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em] font-mono">
                <th className="py-3.5 px-5 w-[20%] font-semibold">
                  {getFirstColumnHeader()}
                </th>

                <th className="py-3.5 px-3 text-right font-semibold">
                  <button 
                    onClick={() => handleSort('eligibleChauffeurs')} 
                    className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                  >
                    ELIGIBLE CHAUFFEUR
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </th>
                
                <th className="py-3.5 px-3 text-right font-semibold">
                  <button 
                    onClick={() => handleSort('totalBookings')} 
                    className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                  >
                    TOTAL BOOKINGS
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </th>

                <th className="py-3.5 px-3 text-right font-semibold">
                  <button 
                    onClick={() => handleSort('bookingsAllocated')} 
                    className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                  >
                    BOOKINGS ALLOCATED
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </th>

                <th className="py-3.5 px-3 text-right font-semibold">
                  <button 
                    onClick={() => handleSort('bookingsAccepted')} 
                    className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                  >
                    BOOKINGS ACCEPTED
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </th>

                <th className="py-3.5 px-3 text-right font-semibold">
                  <button 
                    onClick={() => handleSort('bookingFulfilled')} 
                    className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                  >
                    BOOKING FULFILLED
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </th>

                <th className="py-3.5 px-3 text-right font-semibold">
                  <button 
                    onClick={() => handleSort('bookingFulfilledOnTime')} 
                    className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                  >
                    BOOKING FULFILLED ON TIME
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </th>

                <th className="py-3.5 px-3 text-center font-semibold">
                  <button 
                    onClick={() => handleSort('csat')} 
                    className="inline-flex items-center gap-1 hover:text-slate-900 mx-auto"
                  >
                    CSAT
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </th>

                <th className="py-3.5 px-5 text-right font-semibold">
                  <button 
                    onClick={() => handleSort('complaints')} 
                    className="inline-flex items-center gap-1 hover:text-slate-900 ml-auto"
                  >
                    COMPLAINTS
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                  </button>
                </th>
              </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-800 text-[13px]">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  No records matching your search and filter criteria.
                </td>
              </tr>
            ) : (
              sortedData.map((item) => {
                const eligible = item.eligibleChauffeurs ?? (Math.round(item.totalBookings / 16) || 12);
                const expected = item.chauffeursExpected ?? Math.round(eligible * 0.88);
                const below = eligible - expected;

                const allocatedPct = item.totalBookings > 0 
                  ? ((item.bookingsAllocated / item.totalBookings) * 100).toFixed(1) 
                  : '0';
                
                const acceptedPct = item.bookingsAllocated > 0 
                  ? ((item.bookingsAccepted / item.bookingsAllocated) * 100).toFixed(1) 
                  : '0';

                const fulfilledPct = item.totalBookings > 0 
                  ? ((item.bookingFulfilled / item.totalBookings) * 100).toFixed(1) 
                  : '0';

                const onTimePct = item.bookingFulfilled > 0 
                  ? ((item.bookingFulfilledOnTime / item.bookingFulfilled) * 100).toFixed(1) 
                  : '0';

                // Secondary subtle values
                const autoFulfilled = Math.round(item.bookingFulfilled * 0.912);
                const autoFulfilledPct = item.bookingFulfilled > 0 
                  ? ((autoFulfilled / item.bookingFulfilled) * 100).toFixed(1) 
                  : '0';

                const autoFulfilledOnTime = Math.round(item.bookingFulfilledOnTime * 0.935);
                const autoOnTimePct = item.bookingFulfilledOnTime > 0 
                  ? ((autoFulfilledOnTime / item.bookingFulfilledOnTime) * 100).toFixed(1) 
                  : '0';

                const csatScore = typeof item.csat === 'number' ? item.csat : parseFloat(item.csat) || 4.7;
                const autoCsat = (csatScore + 0.1).toFixed(1);

                const autoComplaints = Math.round(item.complaints * 0.22);

                // Default Row rendering for Partners & Program tabs
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => onSelectItem && onSelectItem(item)}
                        className="text-left group cursor-pointer block"
                      >
                        <span className="font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors block">
                          {item.name}
                        </span>
                        {item.subTitle && (
                          <span className="block text-[11px] text-slate-500 font-normal truncate max-w-[260px] group-hover:text-blue-500 transition-colors">
                            {item.subTitle}
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Eligible Chauffeur: with hover dialogue */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      <div className="relative inline-block group/dialogue">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-bold text-slate-800 hover:text-blue-600 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <span>{eligible.toLocaleString('en-IN')}</span>
                          <Info className="w-3 h-3 text-slate-400 group-hover/dialogue:text-blue-500 transition-colors" />
                        </button>

                        {/* Hover Dialogue Card */}
                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover/dialogue:flex flex-col w-72 p-3 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          {/* Dialogue Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              {currentTab === 'program' ? (
                                <Layers className="w-3.5 h-3.5 text-slate-600" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              )}
                              <span className="truncate max-w-[170px]">{item.name}</span>
                            </div>
                            <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {eligible} Eligible
                            </span>
                          </div>

                          {/* Dialogue Content */}
                          <div className="space-y-2">
                            {/* Recommended Booking Count */}
                            <div className="flex items-center justify-between text-xs bg-blue-50/90 border border-blue-100 rounded-lg p-2">
                              <div className="flex items-center gap-1.5 text-blue-900 font-medium">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>Recommended booking count</span>
                              </div>
                              <span className="font-mono font-bold text-blue-800 text-xs">
                                {item.totalBookings.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* Performed as expected */}
                            <div className="flex items-center justify-between text-xs bg-emerald-50/80 border border-emerald-100 rounded-lg p-2">
                              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{expected} {expected === 1 ? 'Chauffeur' : 'Chauffeurs'} performed as expected</span>
                              </div>
                            </div>

                            {/* Performed below expectation */}
                            <div className="flex items-center justify-between text-xs bg-rose-50/80 border border-rose-100 rounded-lg p-2">
                              <div className="flex items-center gap-1.5 text-rose-800 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{below} {below === 1 ? 'Chauffeur' : 'Chauffeurs'} performed below expectation</span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow down indicator */}
                          <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white border-b border-r border-slate-200/90 rotate-45 transform" />
                        </div>
                      </div>
                    </td>

                    {/* Total Bookings */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {item.totalBookings.toLocaleString('en-IN')}
                    </td>

                    {/* Bookings Allocated: in same line in brackets */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      <span className="font-semibold text-slate-900">
                        {item.bookingsAllocated.toLocaleString('en-IN')}
                      </span>{' '}
                      <span className="text-slate-400 text-xs font-normal">
                        ({allocatedPct}%)
                      </span>
                    </td>

                    {/* Bookings Accepted: in same line in brackets */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      <span className="font-semibold text-slate-900">
                        {item.bookingsAccepted.toLocaleString('en-IN')}
                      </span>{' '}
                      <span className="text-slate-400 text-xs font-normal">
                        ({acceptedPct}%)
                      </span>
                    </td>

                    {/* Booking Fulfilled: Primary + Secondary Subtle */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      <div>
                        <span className="font-bold text-slate-900">
                          {item.bookingFulfilled.toLocaleString('en-IN')}
                        </span>{' '}
                        <span className="text-emerald-600 font-medium text-xs">
                          ({fulfilledPct}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        <span>{autoFulfilled.toLocaleString('en-IN')}</span>{' '}
                        <span className="text-xs">({autoFulfilledPct}%)</span>
                      </div>
                    </td>

                    {/* Booking Fulfilled On Time: Primary + Secondary Subtle */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      <div>
                        <span className="font-bold text-slate-900">
                          {item.bookingFulfilledOnTime.toLocaleString('en-IN')}
                        </span>{' '}
                        <span className="text-emerald-600 font-medium text-xs">
                          ({onTimePct}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        <span>{autoFulfilledOnTime.toLocaleString('en-IN')}</span>{' '}
                        <span className="text-xs">({autoOnTimePct}%)</span>
                      </div>
                    </td>

                    {/* CSAT: Primary + Secondary Subtle (No % for secondary) */}
                    <td className="py-3.5 px-3 text-center">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-700 font-mono font-bold text-xs">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          {item.csat}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono font-normal mt-0.5">
                        {autoCsat}
                      </div>
                    </td>

                    {/* Complaints: Primary + Secondary Subtle (No % for secondary) */}
                    <td className="py-3.5 px-5 text-right font-mono">
                      <div>
                        <span className={item.complaints > 20 ? "text-rose-600 font-bold" : "text-slate-800 font-semibold"}>
                          {item.complaints}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {autoComplaints}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Footer Total Row */}
          <tfoot>
              <tr className="border-t-2 border-slate-200 bg-white font-bold text-[13px] text-slate-900">
                <td className="py-4 px-5">
                  <span className="font-bold">Total / Blended ({totalCount} rows)</span>
                </td>

                {/* Eligible Chauffeurs Footer */}
                <td className="py-4 px-3 text-right font-mono">
                  <div className="relative inline-block group/dialogue">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-blue-600 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <span>{totalEligible.toLocaleString('en-IN')}</span>
                      <Info className="w-3 h-3 text-slate-400 group-hover/dialogue:text-blue-500 transition-colors" />
                    </button>

                    {/* Hover Dialogue */}
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover/dialogue:flex flex-col w-72 p-3 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>All Eligible Chauffeurs</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {totalEligible} Total
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Recommended Booking Count */}
                        <div className="flex items-center justify-between text-xs bg-blue-50/90 border border-blue-100 rounded-lg p-2">
                          <div className="flex items-center gap-1.5 text-blue-900 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Recommended booking count</span>
                          </div>
                          <span className="font-mono font-bold text-blue-800 text-xs">
                            {totalBookings.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-emerald-50/80 border border-emerald-100 rounded-lg p-2">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{totalExpected} Chauffeurs performed as expected</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-rose-50/80 border border-rose-100 rounded-lg p-2">
                          <div className="flex items-center gap-1.5 text-rose-800 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{totalBelow} Chauffeurs performed below expectation</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white border-b border-r border-slate-200/90 rotate-45 transform" />
                    </div>
                  </div>
                </td>

                <td className="py-4 px-3 text-right font-mono font-bold text-slate-900">
                  {totalBookings.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-3 text-right font-mono">
                  <span className="font-bold text-slate-900">{totalAllocated.toLocaleString('en-IN')}</span>{' '}
                  <span className="text-slate-400 text-xs font-normal">({totalAllocatedPct}%)</span>
                </td>
                <td className="py-4 px-3 text-right font-mono">
                  <span className="font-bold text-slate-900">{totalAccepted.toLocaleString('en-IN')}</span>{' '}
                  <span className="text-slate-400 text-xs font-normal">({totalAcceptedPct}%)</span>
                </td>
                
                {/* Fulfilled Footer */}
                <td className="py-4 px-3 text-right font-mono">
                  <div>
                    <span className="font-bold text-slate-900">{totalFulfilled.toLocaleString('en-IN')}</span>{' '}
                    <span className="text-emerald-600 text-xs font-normal">({totalFulfilledPct}%)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    <span>{totalAutoFulfilled.toLocaleString('en-IN')}</span>{' '}
                    <span className="text-xs">({totalAutoFulfilledPct}%)</span>
                  </div>
                </td>

                {/* Fulfilled On-Time Footer */}
                <td className="py-4 px-3 text-right font-mono">
                  <div>
                    <span className="font-bold text-slate-900">{totalFulfilledOnTime.toLocaleString('en-IN')}</span>{' '}
                    <span className="text-emerald-600 text-xs font-normal">({totalOnTimePct}%)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    <span>{totalAutoFulfilledOnTime.toLocaleString('en-IN')}</span>{' '}
                    <span className="text-xs">({totalAutoOnTimePct}%)</span>
                  </div>
                </td>

                {/* CSAT Footer */}
                <td className="py-4 px-3 text-center">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 font-mono font-bold text-xs">
                      <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                      {avgCsat}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono font-normal mt-0.5">
                    4.8
                  </div>
                </td>

                {/* Complaints Footer */}
                <td className="py-4 px-5 text-right font-mono">
                  <div>
                    <span className="font-bold text-slate-900">{totalComplaints}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    {totalAutoComplaints}
                  </div>
                </td>
              </tr>
          </tfoot>
        </table>
      </div>
      )}
    </div>
  );
};
