import React, { useState } from 'react';
import { 
  Info, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle,
  BadgePercent,
  IndianRupee
} from 'lucide-react';
import { DashboardItem } from '../types';

interface MetricCardsProps {
  items?: DashboardItem[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ items = [] }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Dynamic calculations from current items
  const totalBookings = items.length > 0 
    ? items.reduce((acc, c) => acc + c.totalBookings, 0)
    : 2283;
  
  const totalAllocated = items.length > 0
    ? items.reduce((acc, c) => acc + c.bookingsAllocated, 0)
    : 2082;

  const totalFulfilledOnTime = items.length > 0
    ? items.reduce((acc, c) => acc + c.bookingFulfilledOnTime, 0)
    : 1414;

  const fulfilledOnTimePct = totalAllocated > 0
    ? ((totalFulfilledOnTime / totalAllocated) * 100).toFixed(1)
    : '83.4';

  const reassignedCount = Math.round(totalBookings * 0.185);
  const rejectedCount = Math.round(totalBookings * 0.065);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {/* Card 1: CSAT Lift & Quality (CSAT) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[13px] font-semibold text-slate-800">
              CSAT & Quality Lift
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          
          {/* Primary metric: +1.2 (in green) CSAT lift with (i) icon */}
          <div className="flex items-baseline gap-1.5 mb-5">
            <span className="text-2xl sm:text-[26px] font-bold text-emerald-600 tracking-tight font-mono">
              +1.2
            </span>
            <span className="text-xs text-slate-600 font-medium">
              CSAT lift
            </span>

            {/* Tooltip trigger for CSAT lift */}
            <div 
              className="relative inline-block ml-0.5"
              onMouseEnter={() => setActiveTooltip('csat_lift')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <button 
                type="button"
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors focus:outline-hidden cursor-help"
                aria-label="CSAT lift definition"
              >
                <Info className="w-3.5 h-3.5 stroke-[2]" />
              </button>

              {activeTooltip === 'csat_lift' && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-none leading-relaxed">
                  Gain in CSAT of auto allocated booking vs non allocated bookings
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary metric & Bottom metric */}
        <div className="pt-2 border-t border-slate-100/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-emerald-600 font-bold font-mono text-sm">-3</span>
              <span className="text-slate-600 font-medium">Complaint rate</span>

              {/* Tooltip trigger for Complaint rate */}
              <div 
                className="relative inline-block"
                onMouseEnter={() => setActiveTooltip('complaint_rate')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <button 
                  type="button"
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors focus:outline-hidden cursor-help"
                  aria-label="Complaint rate definition"
                >
                  <Info className="w-3.5 h-3.5 stroke-[2]" />
                </button>

                {activeTooltip === 'complaint_rate' && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-none leading-relaxed">
                    Avg complain count difference per 10 bookings for system vs human assigned bookings
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                  </div>
                )}
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
              <TrendingDown className="w-3 h-3 stroke-[2.5]" />
              -62% vs baseline
            </span>
          </div>

          {/* Bottom line metric: Total 5 star CSAT per 10 (+% value) */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Total 5 star CSAT per 10</span>
            <span className="font-semibold text-slate-900 font-mono text-[11px]">
              8.4 <span className="text-emerald-600 font-medium">(+18.2%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Gross Margin Lift (GM) - In between CSAT and Vendor Override */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[13px] font-semibold text-slate-800">
              Gross Margin Lift
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          
          {/* Primary metric: GM Lift (in value INR) with (i) icon */}
          <div className="flex items-baseline gap-1.5 mb-5">
            <span className="text-2xl sm:text-[26px] font-bold text-emerald-600 tracking-tight font-mono">
              +₹185
            </span>
            <span className="text-xs text-slate-600 font-medium">
              GM lift
            </span>

            {/* Tooltip trigger for GM Lift */}
            <div 
              className="relative inline-block ml-0.5"
              onMouseEnter={() => setActiveTooltip('gm_lift')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <button 
                type="button"
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors focus:outline-hidden cursor-help"
                aria-label="GM lift definition"
              >
                <Info className="w-3.5 h-3.5 stroke-[2]" />
              </button>

              {activeTooltip === 'gm_lift' && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-none leading-relaxed">
                  GM per fulfilled booking on auto-allocated bookings vs non-allocated.
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100/80 space-y-1.5 text-xs">
          {/* Secondary Metric: GM per chauffeur gain */}
          <div className="flex items-center justify-between text-slate-600">
            <span>GM per chauffeur gain</span>
            <span className="font-semibold text-slate-900 font-mono">
              +₹1,580
            </span>
          </div>

          {/* Bottom Metric: Absolute GM gain (In Value INR) */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Absolute GM gain</span>
            <span className="font-bold text-emerald-600 font-mono text-[12px]">
              +₹2.84L
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Vendor Override Rate */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[13px] font-semibold text-slate-800">
              Vendor Override Rate
            </span>
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>
          
          {/* Primary metric: 25% Vendor override rate */}
          <div className="flex items-baseline gap-1.5 mb-5">
            <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight font-mono">
              25%
            </span>
            <span className="text-xs text-slate-500 font-normal">
              Vendor override rate
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100/80 space-y-1.5 text-xs">
          {/* Secondary metric: Chauffeurs reassigned count + (% in bracket) */}
          <div className="flex items-center justify-between text-slate-600">
            <span>Chauffeurs reassigned</span>
            <span className="font-semibold text-slate-900 font-mono">
              {reassignedCount.toLocaleString('en-IN')} (18.5%)
            </span>
          </div>

          {/* Metric at bottom: Booking rejected count + (% in bracket) */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Booking rejected</span>
            <span className="font-medium text-slate-700 font-mono text-[11px]">
              {rejectedCount.toLocaleString('en-IN')} (6.5%)
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Fulfillment Performance */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[13px] font-semibold text-slate-800">
              Fulfillment Performance
            </span>
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
              <ShieldCheck className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>
          
          {/* Primary metric: Fulfilled on time count + (% in bracket) */}
          <div className="flex items-baseline gap-1.5 mb-5">
            <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight font-mono">
              {totalFulfilledOnTime.toLocaleString('en-IN')} ({fulfilledOnTimePct}%)
            </span>
            <span className="text-xs text-slate-500 font-normal">
              on-time
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100/80 space-y-1.5 text-xs">
          {/* Secondary metric: Fulfillment % change vs manual bookings */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Fulfillment vs manual</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold font-mono">
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              +14.2% change
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
