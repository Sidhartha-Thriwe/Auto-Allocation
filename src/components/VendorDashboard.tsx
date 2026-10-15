import React, { useState } from 'react';
import { 
  AlertCircle, 
  ShieldAlert, 
  Calendar, 
  Download, 
  Briefcase, 
  Clock, 
  Star, 
  Car, 
  Users,
  ArrowRight,
  ChevronRight,
  Search,
  X,
  Phone,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface ChauffeurRow {
  id: string;
  rating: 'POOR' | 'AVERAGE' | 'GOOD' | 'EXCELLENT';
  name: string;
  totalAssigned: number;
  totalAllocatedCount: number;
  totalAllocatedPct: number;
  fulfilledCount: number;
  fulfilledPct: number;
  fulfilledOnTimeCount: number;
  fulfilledOnTimePct: number;
  rideStartOnTimePct: number;
  rideEndedOnTimePct: number;
  avgDelay?: string;
  csat?: string;
  csatAllocatedBookings?: string;
  complaintRate?: string;
}

const CHAUFFEURS: ChauffeurRow[] = [
  {
    id: 'ch-1',
    rating: 'POOR',
    name: 'ujwall kumar',
    totalAssigned: 2,
    totalAllocatedCount: 2,
    totalAllocatedPct: 100.0,
    fulfilledCount: 1,
    fulfilledPct: 50.0,
    fulfilledOnTimeCount: 0,
    fulfilledOnTimePct: 0.0,
    rideStartOnTimePct: 0,
    rideEndedOnTimePct: 0,
    avgDelay: '-4153m',
    csat: '-',
    csatAllocatedBookings: '4.2',
    complaintRate: '-',
  },
  {
    id: 'ch-2',
    rating: 'POOR',
    name: 'PROD QA V TWO',
    totalAssigned: 9,
    totalAllocatedCount: 8,
    totalAllocatedPct: 88.9,
    fulfilledCount: 0,
    fulfilledPct: 0.0,
    fulfilledOnTimeCount: 0,
    fulfilledOnTimePct: 0.0,
    rideStartOnTimePct: 0,
    rideEndedOnTimePct: 0,
    avgDelay: '-',
    csat: '-',
    csatAllocatedBookings: '-',
    complaintRate: '-',
  },
  {
    id: 'ch-3',
    rating: 'POOR',
    name: 'Test Six',
    totalAssigned: 1,
    totalAllocatedCount: 1,
    totalAllocatedPct: 100.0,
    fulfilledCount: 0,
    fulfilledPct: 0.0,
    fulfilledOnTimeCount: 0,
    fulfilledOnTimePct: 0.0,
    rideStartOnTimePct: 0,
    rideEndedOnTimePct: 0,
    avgDelay: '-',
    csat: '-',
    csatAllocatedBookings: '-',
    complaintRate: '-',
  },
  {
    id: 'ch-4',
    rating: 'POOR',
    name: 'Avinash QA Test',
    totalAssigned: 1,
    totalAllocatedCount: 1,
    totalAllocatedPct: 100.0,
    fulfilledCount: 0,
    fulfilledPct: 0.0,
    fulfilledOnTimeCount: 0,
    fulfilledOnTimePct: 0.0,
    rideStartOnTimePct: 0,
    rideEndedOnTimePct: 0,
    avgDelay: '-',
    csat: '-',
    csatAllocatedBookings: '-',
    complaintRate: '-',
  },
  {
    id: 'ch-5',
    rating: 'POOR',
    name: 'Test Two',
    totalAssigned: 1,
    totalAllocatedCount: 1,
    totalAllocatedPct: 100.0,
    fulfilledCount: 0,
    fulfilledPct: 0.0,
    fulfilledOnTimeCount: 0,
    fulfilledOnTimePct: 0.0,
    rideStartOnTimePct: 0,
    rideEndedOnTimePct: 0,
    avgDelay: '-',
    csat: '-',
    csatAllocatedBookings: '-',
    complaintRate: '-',
  },
];

export const VendorDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState('08-09-2026');
  const [endDate, setEndDate] = useState('07-10-2026');
  const [selectedChauffeur, setSelectedChauffeur] = useState<ChauffeurRow | null>(null);
  const [ridesInProgressOpen, setRidesInProgressOpen] = useState(false);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Rating,Chauffeur,Total Assigned,Total Allocated,Fulfilled,Avg Delay,CSAT,CSAT Allocated\n"
      + CHAUFFEURS.map(e => `${e.rating},${e.name},${e.totalAssigned},${e.totalAllocatedCount} (${e.totalAllocatedPct}%),${e.fulfilledCount},${e.avgDelay || '-'},${e.csat || '-'},${e.csatAllocatedBookings || '-'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vendor_Chauffeur_Leaderboard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1580px] mx-auto font-sans antialiased text-slate-900">
      {/* Title + Date Range + Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#232f4e] tracking-tight leading-none mb-1">
            Vendor Dashboard
          </h1>
          <div className="text-xs text-slate-500 font-medium">
            Vendor Dashboard
          </div>
        </div>

        {/* Top Right Date Range & Export */}
        <div className="flex items-end gap-2.5 self-end sm:self-auto">
          {/* Export Dark Button */}
          <button
            onClick={handleExport}
            title="Download CSV report"
            className="p-2 bg-[#2d3a66] hover:bg-[#202b4d] text-white rounded-lg shadow-2xs transition-colors flex items-center justify-center mb-0.5"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Date Range Selector */}
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
        </div>
      </div>

      {/* Top 2 Warning / Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Banner 1: Warning Bookings */}
        <div className="bg-white border border-amber-300 rounded-xl p-4 shadow-2xs flex items-center justify-between hover:border-amber-400 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100/70 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-sm">
              !
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-amber-600 uppercase font-mono">
                WARNING BOOKINGS
              </div>
              <div className="text-sm font-bold text-slate-900 tracking-tight">
                1 <span className="text-xs font-semibold text-slate-700">ACTIVE ISSUES</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setRidesInProgressOpen(true)}
            className="text-amber-700 hover:text-amber-800 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View Rides In Progress</span>
            <span>→</span>
          </button>
        </div>

        {/* Banner 2: Alert Bookings */}
        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-2xs flex items-center justify-between hover:border-rose-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-rose-600 uppercase font-mono">
                ALERT BOOKINGS
              </div>
              <div className="text-sm font-bold text-slate-900 tracking-tight">
                0 <span className="text-xs font-semibold text-slate-700">CRITICAL ALERTS</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setRidesInProgressOpen(true)}
            className="text-rose-700 hover:text-rose-800 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View Rides In Progress</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Row of 5 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        {/* Card 1: TOTAL BOOKINGS */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 tracking-wider uppercase mb-1.5">
              <span>TOTAL BOOKINGS</span>
              <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                <Briefcase className="w-3 h-3" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight font-mono mb-3">
              19
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Completed:</span>
              <span className="font-bold text-slate-900">5.3% (1)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Via Edge App:</span>
              <span className="font-bold text-slate-900">26.3% (5)</span>
            </div>
          </div>
        </div>

        {/* Card 2: ONGOING BOOKINGS */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 tracking-wider uppercase mb-1.5">
              <span>ONGOING BOOKINGS</span>
              <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                <Clock className="w-3 h-3" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight font-mono mb-3">
              1
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono">
            {/* Secondary metric: Total booking allocated by system count + (% in bracket) */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 truncate mr-1">Total allocated by system:</span>
              <span className="font-bold text-slate-900 shrink-0">18 (94.7%)</span>
            </div>
            {/* Replaced 'Of total' to: Total bookings accepted count + (% in bracket) */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 truncate mr-1">Total bookings accepted:</span>
              <span className="font-bold text-slate-900 shrink-0">16 (84.2%)</span>
            </div>
          </div>
        </div>

        {/* Card 3: CSAT SCORE */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 tracking-wider uppercase mb-1.5">
              <span>CSAT SCORE</span>
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight font-mono mb-3">
              -- / --
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">On-Time:</span>
              <span className="font-bold text-slate-900">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Complaints:</span>
              <span className="font-bold text-rose-600">0 complaints</span>
            </div>
          </div>
        </div>

        {/* Card 4: TOTAL CARS */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 tracking-wider uppercase mb-1.5">
              <span>TOTAL CARS</span>
              <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                <Car className="w-3 h-3" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight font-mono mb-3">
              21
            </div>
          </div>

          <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono text-right font-medium text-slate-700">
            0 Hours Daily active hours
          </div>
        </div>

        {/* Card 5: TOTAL CHAUFFEURS */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 tracking-wider uppercase mb-1.5">
              <span>TOTAL CHAUFFEURS</span>
              <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                <Users className="w-3 h-3" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight font-mono mb-3">
              121
            </div>
          </div>

          <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono text-right font-medium text-slate-700">
            0 Active hours per day
          </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e293b] font-mono">
            CHAUFFEUR PERFORMANCE LEADERBOARD
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] font-semibold text-slate-600 border-b border-slate-200/80 uppercase font-mono">
                <th className="py-3.5 px-4 font-semibold">RATING</th>
                <th className="py-3.5 px-4 font-semibold">CHAUFFEUR</th>
                <th className="py-3.5 px-3 text-right font-semibold">TOTAL ASSIGNED</th>
                <th className="py-3.5 px-3 text-right font-semibold">TOTAL ALLOCATED</th>
                <th className="py-3.5 px-3 text-right font-semibold">FULFILLED</th>
                <th className="py-3.5 px-3 text-right font-semibold">FULFILLED ON-TIME</th>
                <th className="py-3.5 px-3 text-right font-semibold">RIDE START ON-TIME</th>
                <th className="py-3.5 px-3 text-right font-semibold">RIDE ENDED ON-TIME</th>
                <th className="py-3.5 px-3 text-right font-semibold">AVG DELAY</th>
                <th className="py-3.5 px-3 text-center font-semibold">CSAT</th>
                <th className="py-3.5 px-3 text-center font-semibold">CSAT OF ALLOCATED</th>
                <th className="py-3.5 px-4 text-right font-semibold">COMPLAINT RATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] text-slate-800">
              {CHAUFFEURS.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => setSelectedChauffeur(row)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-rose-300 bg-rose-50 text-rose-600 font-mono">
                      {row.rating}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {row.name}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-semibold">
                    {row.totalAssigned}
                  </td>

                  {/* Position: After Total Assigned */}
                  <td className="py-3.5 px-3 text-right font-mono">
                    <span className="font-bold text-slate-900">{row.totalAllocatedCount}</span>{' '}
                    <span className="text-slate-400 text-xs font-normal">({row.totalAllocatedPct.toFixed(1)}%)</span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono">
                    <span className="font-bold text-slate-900">{row.fulfilledCount}</span>{' '}
                    <span className="text-slate-400 text-xs font-normal">({row.fulfilledPct.toFixed(1)}%)</span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono">
                    <span className="font-bold text-slate-900">{row.fulfilledOnTimeCount}</span>{' '}
                    <span className="text-slate-400 text-xs font-normal">({row.fulfilledOnTimePct.toFixed(1)}%)</span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono">
                    {row.rideStartOnTimePct}%
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono">
                    {row.rideEndedOnTimePct}%
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono">
                    {row.avgDelay && row.avgDelay !== '-' ? (
                      <span className="px-2 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-600 font-bold text-xs">
                        {row.avgDelay}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                    {row.csat || '-'}
                  </td>

                  {/* Position: After CSAT */}
                  <td className="py-3.5 px-3 text-center font-mono font-semibold">
                    {row.csatAllocatedBookings && row.csatAllocatedBookings !== '-' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        {row.csatAllocatedBookings}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {row.complaintRate || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-slate-400 py-10">
        Copyright © 2026 Powered by Thriwe
      </footer>

      {/* Rides In Progress Modal */}
      {ridesInProgressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900">Active Rides In Progress</h3>
              </div>
              <button 
                onClick={() => setRidesInProgressOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">RIDE-DXB-99214</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    Warning: 12m Driver Delay
                  </span>
                </div>
                <div className="text-slate-700">
                  Chauffeur: <span className="font-semibold">ujwall kumar</span> · Vehicle: Lexus ES 300h
                </div>
                <div className="text-slate-500 text-[11px]">
                  Pickup: Terminal 3, DXB Airport → Dropoff: Address Downtown
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setRidesInProgressOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chauffeur Detail Modal */}
      {selectedChauffeur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900">{selectedChauffeur.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Chauffeur ID: {selectedChauffeur.id}</p>
              </div>
              <button 
                onClick={() => setSelectedChauffeur(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px]">Assigned Rides</div>
                  <div className="text-lg font-bold font-mono text-slate-900">{selectedChauffeur.totalAssigned}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[11px]">Allocated Rides</div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {selectedChauffeur.totalAllocatedCount} ({selectedChauffeur.totalAllocatedPct}%)
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Rating Tier:</span>
                  <span className="font-bold text-rose-600 font-mono">{selectedChauffeur.rating}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CSAT of Allocated:</span>
                  <span className="font-bold text-emerald-600 font-mono">{selectedChauffeur.csatAllocatedBookings || '-'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Average Delay:</span>
                  <span className="font-bold text-rose-600 font-mono">{selectedChauffeur.avgDelay || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setSelectedChauffeur(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
