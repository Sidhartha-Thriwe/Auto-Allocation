import React from 'react';
import { Upload, Trophy } from 'lucide-react';
import { DateRangeOption, DateFilterSelection } from '../types';
import { DateFilter } from './DateFilter';

interface HeaderProps {
  dateRange?: DateRangeOption;
  onDateRangeChange?: (range: DateRangeOption) => void;
  dateSelection: DateFilterSelection;
  onDateSelectionChange: (selection: DateFilterSelection) => void;
  onOpenExport: () => void;
  onOpenAllocationLeaderboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dateSelection,
  onDateSelectionChange,
  onOpenExport,
  onOpenAllocationLeaderboard,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 pb-4">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-none">
          Dashboard
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
        {/* Allocation leaderboard CTA */}
        <button
          onClick={onOpenAllocationLeaderboard}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs sm:text-[13px] font-semibold shadow-xs transition-all cursor-pointer border border-slate-900 hover:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/20"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Allocation leaderboard</span>
        </button>

        {/* Granular Date Filter: Day | Week | Month */}
        <DateFilter
          selection={dateSelection}
          onSelectionChange={onDateSelectionChange}
        />

        {/* Share/Export button */}
        <button
          onClick={onOpenExport}
          title="Share or Export"
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white border border-slate-200/90 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-slate-400/20 cursor-pointer"
          aria-label="Export and Share"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
