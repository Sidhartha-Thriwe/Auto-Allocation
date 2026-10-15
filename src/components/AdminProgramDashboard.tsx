import React, { useState } from 'react';
import { 
  Info, 
  Calendar, 
  ChevronDown, 
  ArrowRight, 
  ChevronRight,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { BookingsDetailModal } from './BookingsDetailModal';

interface ProgramRow {
  id: string;
  projectName: string;
  totalBookings: number;
  toBeServiced: number;
  ainaContribution: number;
  posContribution: number;
  completeBooking: number;
  cancelledBooking: number;
  fulfillmentPct: number;
  fulfillmentDisplay?: string;
  complaints: number;
}

interface VendorRow {
  id: string;
  vendorName: string;
  totalAssigned: number;
  serviced: number;
  onTimeArrivalRate: number;
  avgPainMinutes: number;
  slaBreaches: number;
  complaints: number;
  fulfillmentPct: number;
}

const PROGRAM_ROWS: ProgramRow[] = [
  {
    id: 'prog-1',
    projectName: 'ENBD Concierge Benefit',
    totalBookings: 1263,
    toBeServiced: 2652,
    ainaContribution: 0,
    posContribution: 0,
    completeBooking: 783,
    cancelledBooking: 178,
    fulfillmentPct: 29.52,
    fulfillmentDisplay: '29.52%',
    complaints: 47,
  },
  {
    id: 'prog-2',
    projectName: 'Alrajhi Concierge',
    totalBookings: 639,
    toBeServiced: 1382,
    ainaContribution: 0,
    posContribution: 0,
    completeBooking: 508,
    cancelledBooking: 132,
    fulfillmentPct: 36.76,
    fulfillmentDisplay: '36.76%',
    complaints: 100,
  },
  {
    id: 'prog-3',
    projectName: 'EIB Concierge Benefit',
    totalBookings: 93,
    toBeServiced: 230,
    ainaContribution: 0,
    posContribution: 0,
    completeBooking: 50,
    cancelledBooking: 32,
    fulfillmentPct: 21.74,
    fulfillmentDisplay: '21.74%',
    complaints: 6,
  },
  {
    id: 'prog-4',
    projectName: 'DIB',
    totalBookings: 53,
    toBeServiced: 105,
    ainaContribution: 0,
    posContribution: 0,
    completeBooking: 31,
    cancelledBooking: 4,
    fulfillmentPct: 29.52,
    fulfillmentDisplay: '29.52%',
    complaints: 4,
  },
  {
    id: 'prog-5',
    projectName: 'SC Privileges',
    totalBookings: 14,
    toBeServiced: 32,
    ainaContribution: 0,
    posContribution: 0,
    completeBooking: 8,
    cancelledBooking: 2,
    fulfillmentPct: 25,
    fulfillmentDisplay: '25%',
    complaints: 2,
  },
];

const VENDOR_ROWS: VendorRow[] = [
  {
    id: 'ven-1',
    vendorName: 'Careem Business Fleet (UAE)',
    totalAssigned: 1140,
    serviced: 742,
    onTimeArrivalRate: 94.2,
    avgPainMinutes: 12,
    slaBreaches: 18,
    complaints: 34,
    fulfillmentPct: 65.1,
  },
  {
    id: 'ven-2',
    vendorName: 'Sixt Chauffeur Drive',
    totalAssigned: 520,
    serviced: 388,
    onTimeArrivalRate: 98.1,
    avgPainMinutes: 4,
    slaBreaches: 3,
    complaints: 8,
    fulfillmentPct: 74.6,
  },
  {
    id: 'ven-3',
    vendorName: 'Blacklane Global Mobility',
    totalAssigned: 280,
    serviced: 210,
    onTimeArrivalRate: 99.0,
    avgPainMinutes: 2,
    slaBreaches: 1,
    complaints: 3,
    fulfillmentPct: 75.0,
  },
  {
    id: 'ven-4',
    vendorName: 'Emirates VIP Chauffeurs',
    totalAssigned: 133,
    serviced: 40,
    onTimeArrivalRate: 88.5,
    avgPainMinutes: 28,
    slaBreaches: 14,
    complaints: 12,
    fulfillmentPct: 30.1,
  },
];

interface AdminProgramDashboardProps {
  onNavigateToDashboard?: () => void;
}

export const AdminProgramDashboard: React.FC<AdminProgramDashboardProps> = ({
  onNavigateToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'Program' | 'Vendors'>('Program');
  const [startDate, setStartDate] = useState('01-10-2026');
  const [endDate, setEndDate] = useState('31-12-2026');
  const [timezone, setTimezone] = useState('Asia/Kolkata (UTC+05:30)');
  const [tzDropdownOpen, setTzDropdownOpen] = useState(false);

  // Drilldown modal state
  const [drilldown, setDrilldown] = useState<{
    isOpen: boolean;
    title: string;
    projectName: string;
    type: 'completed' | 'cancelled' | 'complaints' | 'general';
    count: number;
  }>({
    isOpen: false,
    title: '',
    projectName: '',
    type: 'general',
    count: 0,
  });

  const timezones = [
    'Asia/Kolkata (UTC+05:30)',
    'Asia/Dubai (UTC+04:00)',
    'Europe/London (UTC+01:00)',
    'America/New_York (UTC-04:00)',
    'Asia/Singapore (UTC+08:00)',
  ];

  const handleOpenDrilldown = (
    title: string,
    projectName: string,
    type: 'completed' | 'cancelled' | 'complaints' | 'general',
    count: number
  ) => {
    setDrilldown({
      isOpen: true,
      title,
      projectName,
      type,
      count,
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1580px] mx-auto font-sans antialiased text-slate-900">
      {/* Page Title + Breadcrumbs + Top Right Selectors */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#232f4e] tracking-tight leading-none mb-1.5">
            Program Dashboard
          </h1>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-800">Analytics</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500 font-normal">Airport Transfer Booking</span>
          </div>
        </div>

        {/* Date Range & Timezone controls */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-end lg:self-auto">
          {/* Date Range Box */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
              DATE RANGE
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono shadow-2xs hover:border-slate-300 transition-colors">
              <span>{startDate}</span>
              <span className="text-slate-400">→</span>
              <span>{endDate}</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </div>
          </div>

          {/* Timezone Box */}
          <div className="relative">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
              TIMEZONE
            </div>
            <button
              onClick={() => setTzDropdownOpen(!tzDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono shadow-2xs hover:border-slate-300 transition-colors"
            >
              <span>{timezone}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
            </button>

            {tzDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs">
                {timezones.map((tz) => (
                  <button
                    key={tz}
                    onClick={() => {
                      setTimezone(tz);
                      setTzDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 transition-colors ${
                      timezone === tz ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tz}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: TOTAL BOOKINGS (with red/pink border and alert banner) */}
        <div className="bg-white rounded-xl border border-red-300/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-red-400 transition-all">
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 tracking-wider uppercase mb-2">
              <span>TOTAL BOOKINGS</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mb-1">
              2,073
            </div>
            <div className="text-emerald-500 text-sm font-bold font-mono">
              -
            </div>
          </div>

          {/* Bottom Alert Banner */}
          <div className="bg-[#fff1f2] border-t border-rose-100 px-4 py-2 text-[12px] text-rose-600 font-medium">
            29.25% of Total Bookings are completed
          </div>
        </div>

        {/* Card 2: GROSS MARGIN */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 tracking-wider uppercase mb-2">
              <span>GROSS MARGIN</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mb-1">
              ₹71.53L
            </div>
            <div className="text-emerald-500 text-sm font-bold font-mono">
              -
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 3: FULFILLMENT (Clickable to navigate to Dashboard) */}
        <div 
          onClick={onNavigateToDashboard}
          title="Click to view Lead Gen Performance Dashboard"
          className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 tracking-wider uppercase mb-2">
              <span className="group-hover:text-blue-600 transition-colors">FULFILLMENT</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mb-1">
              31.3%
            </div>
            <div className="text-emerald-500 text-sm font-bold font-mono">
              -
            </div>
          </div>
          <div className="pt-2 flex items-center justify-end text-[11px] text-slate-400 group-hover:text-blue-600 font-medium transition-colors">
            <span>Go to Dashboard →</span>
          </div>
        </div>

        {/* Card 4: PAIN MINUTES */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 tracking-wider uppercase mb-2">
              <span>PAIN MINUTES</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mb-1">
              22,240m
            </div>
            <div className="text-emerald-500 text-sm font-bold font-mono">
              -
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row: Program & Vendors */}
      <div className="flex items-center gap-6 mb-3 border-b border-slate-200/90 px-1">
        <button
          onClick={() => setActiveTab('Program')}
          className={`pb-2.5 text-xs font-semibold tracking-wide transition-all relative ${
            activeTab === 'Program'
              ? 'text-teal-600 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Program
          {activeTab === 'Program' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('Vendors')}
          className={`pb-2.5 text-xs font-semibold tracking-wide transition-all relative ${
            activeTab === 'Vendors'
              ? 'text-teal-600 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vendors
          {activeTab === 'Vendors' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'Program' ? (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#f3f4f6]/80 text-[12px] font-semibold text-slate-800 border-b border-slate-200">
                  <th className="py-3 px-5 font-semibold">Project Name</th>
                  <th className="py-3 px-4 font-semibold">Total Bookings</th>
                  <th className="py-3 px-4 font-semibold">To Be Serviced</th>
                  <th className="py-3 px-4 font-semibold">AINA Contribution</th>
                  <th className="py-3 px-4 font-semibold">POS Contribution</th>
                  <th className="py-3 px-4 font-semibold">Complete Booking</th>
                  <th className="py-3 px-4 font-semibold">Cancelled Booking</th>
                  <th className="py-3 px-4 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      Fulfillment (%)
                      <Info className="w-3 h-3 text-slate-400" />
                    </span>
                  </th>
                  <th className="py-3 px-5 font-semibold">Complaints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-slate-800">
                {PROGRAM_ROWS.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {row.projectName}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {row.totalBookings.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {row.toBeServiced.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {row.ainaContribution}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {row.posContribution}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <button
                        onClick={() => handleOpenDrilldown('Completed Bookings', row.projectName, 'completed', row.completeBooking)}
                        className="text-[#0284c7] hover:underline font-semibold"
                      >
                        {row.completeBooking}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <button
                        onClick={() => handleOpenDrilldown('Cancelled Bookings', row.projectName, 'cancelled', row.cancelledBooking)}
                        className="text-[#0284c7] hover:underline font-semibold"
                      >
                        {row.cancelledBooking}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#ef4444]">
                      {row.fulfillmentDisplay || `${row.fulfillmentPct}%`}
                    </td>
                    <td className="py-4 px-5 font-mono">
                      <button
                        onClick={() => handleOpenDrilldown('Customer Complaints', row.projectName, 'complaints', row.complaints)}
                        className="text-[#0284c7] hover:underline font-semibold"
                      >
                        {row.complaints}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#f3f4f6]/80 text-[12px] font-semibold text-slate-800 border-b border-slate-200">
                  <th className="py-3 px-5 font-semibold">Vendor Name</th>
                  <th className="py-3 px-4 font-semibold">Total Assigned</th>
                  <th className="py-3 px-4 font-semibold">Serviced</th>
                  <th className="py-3 px-4 font-semibold">On-Time Arrival Rate</th>
                  <th className="py-3 px-4 font-semibold">Avg Pain Minutes</th>
                  <th className="py-3 px-4 font-semibold">SLA Breaches</th>
                  <th className="py-3 px-4 font-semibold">Complaints</th>
                  <th className="py-3 px-5 font-semibold">Fulfillment (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-slate-800">
                {VENDOR_ROWS.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {row.vendorName}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {row.totalAssigned.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {row.serviced.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-600 font-semibold">
                      {row.onTimeArrivalRate}%
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {row.avgPainMinutes}m
                    </td>
                    <td className="py-4 px-4 font-mono text-rose-600 font-semibold">
                      {row.slaBreaches}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      <button
                        onClick={() => handleOpenDrilldown('Vendor Complaints', row.vendorName, 'complaints', row.complaints)}
                        className="text-[#0284c7] hover:underline font-semibold"
                      >
                        {row.complaints}
                      </button>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-slate-900">
                      {row.fulfillmentPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-slate-400 py-10">
        Copyright © 2026 Powered by Thriwe
      </footer>

      {/* Drilldown Modal */}
      <BookingsDetailModal
        isOpen={drilldown.isOpen}
        onClose={() => setDrilldown((prev) => ({ ...prev, isOpen: false }))}
        title={drilldown.title}
        projectName={drilldown.projectName}
        type={drilldown.type}
        count={drilldown.count}
      />
    </div>
  );
};
