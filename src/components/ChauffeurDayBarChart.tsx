import React from 'react';
import { PeriodDayInfo, ChauffeurFulfillmentDetail } from '../types';

interface ChauffeurDayBarChartProps {
  dayInfo: PeriodDayInfo;
  rank: 'Top 10' | 'Top 20' | 'Top 50';
  bookingsRecommended: number;
  bookingsFulfilled: number;
  section: 'section1' | 'section2' | 'section3';
  chauffeurName: string;
  partnerName?: string;
  fulfillmentDetail?: ChauffeurFulfillmentDetail;
  maxDailyBookings?: number;
}

export const ChauffeurDayBarChart: React.FC<ChauffeurDayBarChartProps> = ({
  dayInfo,
  rank,
  bookingsRecommended,
  bookingsFulfilled,
  section,
  chauffeurName,
  partnerName,
  fulfillmentDetail,
  maxDailyBookings = 6,
}) => {
  const isZero = bookingsRecommended === 0 && bookingsFulfilled === 0;
  const isDotted = section === 'section3';

  // Calculate stack heights
  const containerHeightPx = 38;
  const totalBarHeightPx = Math.max(
    14,
    Math.min(containerHeightPx, Math.round((bookingsRecommended / maxDailyBookings) * containerHeightPx))
  );

  const fulfilledRatio = bookingsRecommended > 0 ? Math.min(bookingsFulfilled, bookingsRecommended) / bookingsRecommended : 0;
  const fulfilledHeightPx = Math.round(totalBarHeightPx * fulfilledRatio);
  const recommendedHeightPx = Math.max(0, totalBarHeightPx - fulfilledHeightPx);

  const fulfillmentPct = bookingsRecommended > 0 ? Math.round((bookingsFulfilled / bookingsRecommended) * 100) : 0;

  // Rank Color Configurations
  // Top 10 = Green, Top 20 = Blue, Top 50 = Yellow
  const getRankBadgeClasses = () => {
    switch (rank) {
      case 'Top 10':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Top 20':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Top 50':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="relative group/chart flex flex-col items-center justify-end h-11 w-full px-0.5 cursor-pointer">
      {/* Visual Item: Dot vs 2-Stack Bar */}
      {isZero ? (
        // Zero Bookings: Render Colored Dot (Green, Blue, or Yellow based on rank)
        <div className="flex items-center justify-center h-full w-full">
          {isDotted ? (
            // Section 3: Dotted Outer Border Dot
            <span
              className={`w-2.5 h-2.5 rounded-full border-2 border-dotted transition-transform group-hover/chart:scale-150 ${
                rank === 'Top 10'
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : rank === 'Top 20'
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-amber-400 bg-amber-50/50'
              }`}
              title="No bookings (Forecasted)"
            />
          ) : (
            // Section 1 & 2: Colored Solid Dot
            <span
              className={`w-2 h-2 rounded-full transition-transform group-hover/chart:scale-150 ${
                rank === 'Top 10'
                  ? 'bg-emerald-500'
                  : rank === 'Top 20'
                  ? 'bg-blue-500'
                  : 'bg-amber-400'
              }`}
              title="No bookings"
            />
          )}
        </div>
      ) : (
        // Non-Zero Bookings: Render Continuous 2-Stack Bar Chart
        <div
          className="w-4 sm:w-5 flex flex-col justify-end transition-all duration-150 group-hover/chart:brightness-105 group-hover/chart:scale-y-105 origin-bottom"
          style={{ height: `${totalBarHeightPx}px` }}
        >
          {/* Stack 1 (Top): Bookings Recommended */}
          {recommendedHeightPx > 0 && (
            <div
              className={`w-full transition-all rounded-t-[3px] ${
                isDotted
                  ? rank === 'Top 10'
                    ? 'border-t-2 border-x-2 border-dotted border-emerald-500 bg-emerald-100/70'
                    : rank === 'Top 20'
                    ? 'border-t-2 border-x-2 border-dotted border-blue-500 bg-blue-100/70'
                    : 'border-t-2 border-x-2 border-dotted border-amber-500 bg-amber-100/70'
                  : rank === 'Top 10'
                  ? 'bg-emerald-200/90 border-t border-x border-emerald-400'
                  : rank === 'Top 20'
                  ? 'bg-blue-200/90 border-t border-x border-blue-400'
                  : 'bg-amber-200/90 border-t border-x border-amber-300'
              }`}
              style={{ height: `${recommendedHeightPx}px` }}
              title={`Recommended: ${bookingsRecommended}`}
            />
          )}

          {/* Stack 2 (Bottom): Bookings Fulfilled */}
          {fulfilledHeightPx > 0 && (
            <div
              className={`w-full transition-all ${
                isDotted
                  ? rank === 'Top 10'
                    ? 'border-x-2 border-b-2 border-dotted border-emerald-600 bg-emerald-300/80 rounded-b-[2px]'
                    : rank === 'Top 20'
                    ? 'border-x-2 border-b-2 border-dotted border-blue-600 bg-blue-300/80 rounded-b-[2px]'
                    : 'border-x-2 border-b-2 border-dotted border-amber-600 bg-amber-300/80 rounded-b-[2px]'
                  : rank === 'Top 10'
                  ? 'bg-emerald-500 rounded-b-[2px]'
                  : rank === 'Top 20'
                  ? 'bg-blue-500 rounded-b-[2px]'
                  : 'bg-amber-400 rounded-b-[2px]'
              }`}
              style={{ height: `${fulfilledHeightPx}px` }}
              title={`Fulfilled: ${bookingsFulfilled}`}
            />
          )}
        </div>
      )}

      {/* Rich Day Tooltip on Hover */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/chart:flex flex-col w-60 p-2.5 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
        {/* Tooltip Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
          <div>
            <span className="block text-xs font-bold text-slate-900 leading-tight">
              {dayInfo.fullDate}
            </span>
            <span className="block text-[10px] text-slate-500 truncate max-w-[130px]">
              {chauffeurName} {partnerName ? `· ${partnerName}` : ''}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRankBadgeClasses()}`}>
            {rank}
          </span>
        </div>

        {/* Section Type Tag */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2 bg-slate-50 px-2 py-1 rounded">
          <span>Type:</span>
          <span className="font-semibold text-slate-800">
            {isDotted ? 'Upcoming / Forecast (Dotted)' : 'Actual Period (Solid)'}
          </span>
        </div>

        {/* Breakdown Content */}
        {isZero ? (
          <div className="text-center py-2 text-xs text-slate-500 italic bg-slate-50/50 rounded-md">
            No bookings recommended or fulfilled on this day
          </div>
        ) : (
          <div className="space-y-1.5 text-xs">
            {/* 2-Stack Summary */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100 font-mono">
              <div className="text-left">
                <span className="text-[10px] text-slate-500 block">Stack 1 (Rec.)</span>
                <span className="text-xs font-bold text-slate-800">{bookingsRecommended}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Stack 2 (Ful.)</span>
                <span className="text-xs font-bold text-emerald-600">
                  {bookingsFulfilled} ({fulfillmentPct}%)
                </span>
              </div>
            </div>

            {/* Performance Detail if available and not Section 3 */}
            {!isDotted && fulfillmentDetail && (
              <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                <div className="flex items-center justify-between py-0.5 text-slate-600">
                  <span>Fulfilled on time:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {fulfillmentDetail.bookingsFulfilledOnTime.count}{' '}
                    <span className="text-emerald-600">{fulfillmentDetail.bookingsFulfilledOnTime.suffix}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 text-slate-600">
                  <span>DSAT:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {fulfillmentDetail.dsat.count}{' '}
                    <span className="text-rose-600">{fulfillmentDetail.dsat.suffix}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 text-slate-600">
                  <span>Warnings:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {fulfillmentDetail.warnings.count}{' '}
                    <span className="text-amber-600">{fulfillmentDetail.warnings.suffix}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 text-slate-600">
                  <span>No show:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {fulfillmentDetail.noShow.count}{' '}
                    <span className="text-rose-600">{fulfillmentDetail.noShow.suffix}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5 text-slate-600">
                  <span>Happy rating:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {fulfillmentDetail.happyRating.count}{' '}
                    <span className="text-emerald-600">{fulfillmentDetail.happyRating.suffix}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tooltip Downward Arrow */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-slate-200 rotate-45 transform" />
      </div>
    </div>
  );
};
