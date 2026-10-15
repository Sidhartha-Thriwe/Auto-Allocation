import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { DateFilterGranularity, DateFilterSelection } from '../types';
import {
  getYesterday,
  getLastWeekMonday,
  getLastMonthYearAndMonth,
  getDayPresets,
  getWeekPresets,
  getMonthPresets,
  getDefaultSelection,
  canStepForward,
  stepBackward,
  stepForward,
  createDaySelection,
  toISODate,
  formatDateShort,
} from '../utils/dateFilterUtils';

interface DateFilterProps {
  selection: DateFilterSelection;
  onSelectionChange: (selection: DateFilterSelection) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  selection,
  onSelectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar month state for day picker
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2026, 9, 1)); // October 2026

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGranularityChange = (granularity: DateFilterGranularity) => {
    if (selection.granularity === granularity) return;
    const defaultSel = getDefaultSelection(granularity);
    onSelectionChange(defaultSel);
  };

  const handlePrevStep = () => {
    const updated = stepBackward(selection);
    onSelectionChange(updated);
  };

  const handleNextStep = () => {
    if (!canStepForward(selection)) return;
    const updated = stepForward(selection);
    onSelectionChange(updated);
  };

  const yesterday = useMemo(() => getYesterday(), []);
  const lastWeekMon = useMemo(() => getLastWeekMonday(), []);
  const lastMonth = useMemo(() => getLastMonthYearAndMonth(), []);

  // Quick presets
  const dayPresets = useMemo(() => getDayPresets(7), []);
  const weekPresets = useMemo(() => getWeekPresets(6), []);
  const monthPresets = useMemo(() => getMonthPresets(8), []);

  const forwardEnabled = canStepForward(selection);

  // Mini calendar for Day selection mode
  const calendarDays = useMemo(() => {
    if (selection.granularity !== 'day') return [];
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Adjust so Monday is 0
    const startPadding = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ day: number; date: Date; disabled: boolean; isCurrentSelected: boolean } | null> = [];

    for (let p = 0; p < startPadding; p++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      dateObj.setHours(0, 0, 0, 0);
      const disabled = dateObj.getTime() > yesterday.getTime();
      const isCurrentSelected = toISODate(dateObj) === selection.startDate;
      days.push({ day: d, date: dateObj, disabled, isCurrentSelected });
    }

    return days;
  }, [selection.granularity, selection.startDate, calendarMonth, yesterday]);

  const monthYearLabel = useMemo(() => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`;
  }, [calendarMonth]);

  const canAdvanceCalendar = useMemo(() => {
    // Cannot advance past October 2026 (reference month)
    return calendarMonth.getFullYear() < 2026 || (calendarMonth.getFullYear() === 2026 && calendarMonth.getMonth() < 9);
  }, [calendarMonth]);

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={containerRef}>
      {/* 1. Segmented Control: Day | Week | Month */}
      <div
        className="inline-flex p-0.5 bg-slate-100/90 border border-slate-200/90 rounded-lg shadow-2xs"
        role="tablist"
        aria-label="Date granularity"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selection.granularity === 'day'}
          onClick={() => handleGranularityChange('day')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            selection.granularity === 'day'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Day
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selection.granularity === 'week'}
          onClick={() => handleGranularityChange('week')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            selection.granularity === 'week'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Week
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selection.granularity === 'month'}
          onClick={() => handleGranularityChange('month')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            selection.granularity === 'month'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Month
        </button>
      </div>

      {/* 2. Active Period Display Button */}
      <div className="inline-flex items-center bg-white border border-slate-200/90 rounded-lg shadow-2xs">
        {/* Quick Stepper: Previous */}
        <button
          type="button"
          onClick={handlePrevStep}
          title={`Previous ${selection.granularity}`}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg transition-colors border-r border-slate-200/70 cursor-pointer"
          aria-label={`Previous ${selection.granularity}`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Current Date Button (opens picker) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-[13px] font-medium text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer select-none"
          aria-expanded={isOpen}
          aria-label="Select date range"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-900 max-w-[200px] truncate">
            {selection.label}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Quick Stepper: Next (disabled if at max allowed boundary) */}
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!forwardEnabled}
          title={
            forwardEnabled
              ? `Next ${selection.granularity}`
              : `Cannot advance past ${
                  selection.granularity === 'day'
                    ? 'yesterday'
                    : selection.granularity === 'week'
                    ? 'last week'
                    : 'last month'
                }`
          }
          className={`p-1.5 rounded-r-lg transition-colors border-l border-slate-200/70 ${
            forwardEnabled
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer'
              : 'text-slate-300 bg-slate-50/50 cursor-not-allowed'
          }`}
          aria-label={`Next ${selection.granularity}`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Header Rule Indicator */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900 capitalize">
                Select {selection.granularity}
              </span>
              <p className="text-[11px] text-slate-500">
                {selection.granularity === 'day' && 'Single day only · Up to yesterday (Oct 13)'}
                {selection.granularity === 'week' && 'Complete week only (Mon – Sun) · Up to last week'}
                {selection.granularity === 'month' && 'Complete month only · Up to last month'}
              </p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md">
              No partial ranges
            </span>
          </div>

          {/* GRANULARITY: DAY */}
          {selection.granularity === 'day' && (
            <div>
              {/* Quick Preset Buttons */}
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick Select
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {dayPresets.slice(0, 4).map((p) => {
                    const isSelected = p.startDate === selection.startDate;
                    return (
                      <button
                        key={p.startDate}
                        type="button"
                        onClick={() => {
                          onSelectionChange(p);
                          setIsOpen(false);
                        }}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-slate-900 text-white font-semibold border-slate-900'
                            : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                        }`}
                      >
                        <span className="truncate">{p.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-white ml-1 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Month Calendar for Direct Day Picking */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-slate-800">{monthYearLabel}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                        )
                      }
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                      title="Previous month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!canAdvanceCalendar}
                      onClick={() =>
                        canAdvanceCalendar &&
                        setCalendarMonth(
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                        )
                      }
                      className={`p-1 rounded transition-colors ${
                        canAdvanceCalendar
                          ? 'hover:bg-slate-100 text-slate-600 cursor-pointer'
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                      title={canAdvanceCalendar ? 'Next month' : 'Cannot advance to future months'}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day of Week Headers (Mon - Sun) */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-semibold text-slate-400">
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                  <span>Su</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((item, idx) => {
                    if (!item) {
                      return <div key={`empty-${idx}`} className="h-7" />;
                    }
                    const { day, date, disabled, isCurrentSelected } = item;
                    return (
                      <button
                        key={toISODate(date)}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          onSelectionChange(createDaySelection(date));
                          setIsOpen(false);
                        }}
                        title={disabled ? 'Cannot select today or future days (till yesterday only)' : formatDateShort(date)}
                        className={`h-7 rounded text-xs flex items-center justify-center font-medium transition-all ${
                          isCurrentSelected
                            ? 'bg-slate-900 text-white font-bold shadow-xs'
                            : disabled
                            ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" /> Selected
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" /> Disabled (&gt; yesterday)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* GRANULARITY: WEEK */}
          {selection.granularity === 'week' && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Select Complete Calendar Week (Mon – Sun)
              </span>

              {/* Disabled current in-progress week indicator */}
              <div
                className="px-3 py-2 rounded-lg text-xs bg-slate-50 border border-dashed border-slate-200 text-slate-400 flex items-center justify-between select-none cursor-not-allowed"
                title="Current week is in-progress; only complete weeks can be selected"
              >
                <div>
                  <div className="font-medium text-slate-500">Current Week (Oct 12 – Oct 18, 2026)</div>
                  <div className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 inline" /> In progress · complete week required
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-slate-200/70 text-slate-500 px-1.5 py-0.5 rounded">
                  Disabled
                </span>
              </div>

              {/* Past complete weeks */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 pt-1">
                {weekPresets.map((w, index) => {
                  const isSelected = w.startDate === selection.startDate;
                  return (
                    <button
                      key={w.startDate}
                      type="button"
                      onClick={() => {
                        onSelectionChange(w);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 text-white font-semibold border-slate-900'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <span>{w.label}</span>
                          {index === 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 font-medium'
                              }`}
                            >
                              Latest
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] font-mono mt-0.5 ${
                            isSelected ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          Monday to Sunday · Complete 7 days
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* GRANULARITY: MONTH */}
          {selection.granularity === 'month' && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Select Complete Calendar Month
              </span>

              {/* Disabled current in-progress month indicator */}
              <div
                className="px-3 py-2 rounded-lg text-xs bg-slate-50 border border-dashed border-slate-200 text-slate-400 flex items-center justify-between select-none cursor-not-allowed"
                title="Current month is in-progress; only complete months can be selected"
              >
                <div>
                  <div className="font-medium text-slate-500">October 2026</div>
                  <div className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 inline" /> In progress · complete month required
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-slate-200/70 text-slate-500 px-1.5 py-0.5 rounded">
                  Disabled
                </span>
              </div>

              {/* Past complete months list */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 pt-1">
                {monthPresets.map((m, index) => {
                  const isSelected = m.startDate === selection.startDate;
                  return (
                    <button
                      key={m.startDate}
                      type="button"
                      onClick={() => {
                        onSelectionChange(m);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 text-white font-semibold border-slate-900'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <span>{m.label}</span>
                          {index === 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 font-medium'
                              }`}
                            >
                              Latest
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] font-mono mt-0.5 ${
                            isSelected ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          Full calendar month · 1st to end
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
