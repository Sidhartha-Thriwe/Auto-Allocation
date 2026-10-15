import React from 'react';
import { X, Star, CheckCircle2, ShieldCheck, TrendingUp, AlertCircle, Phone, MapPin } from 'lucide-react';
import { DashboardItem } from '../types';

interface ItemDetailModalProps {
  item: DashboardItem | null;
  onClose: () => void;
  onToggleStatus?: (id: string) => void;
}

export const CampaignDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const fulfillmentPct = item.totalBookings > 0 
    ? ((item.bookingFulfilled / item.totalBookings) * 100).toFixed(1) 
    : '0';

  const onTimePct = item.bookingFulfilled > 0 
    ? ((item.bookingFulfilledOnTime / item.bookingFulfilled) * 100).toFixed(1) 
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{item.name}</h2>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              {item.subTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 mb-1">Total Bookings</div>
              <div className="text-base font-bold font-mono text-slate-900">
                {item.totalBookings.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 mb-1">Booking Fulfilled</div>
              <div className="text-base font-bold font-mono text-slate-900">
                {item.bookingFulfilled.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                {fulfillmentPct}% rate
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500 mb-1">CSAT Rating</div>
              <div className="flex items-center gap-1 text-base font-bold font-mono text-slate-900">
                <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                {item.csat}
              </div>
              <div className="text-[10px] text-slate-400">
                {item.complaints} complaints
              </div>
            </div>
          </div>

          {/* Allocation & Acceptance Funnel */}
          <div className="p-4 rounded-xl border border-slate-100 bg-[#f8fafc] space-y-3">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span>Allocation & Acceptance Funnel</span>
              <span className="font-mono text-slate-900 font-bold">
                {onTimePct}% On-Time Delivery
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                <div className="text-slate-400 text-[11px]">Bookings Allocated</div>
                <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                  {item.bookingsAllocated.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                <div className="text-slate-400 text-[11px]">Bookings Accepted</div>
                <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                  {item.bookingsAccepted.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
