import { DateFilterGranularity, DateFilterSelection, PeriodDayInfo } from '../types';

// Reference date anchored to the app environment: Oct 14, 2026
const REFERENCE_DATE = new Date(2026, 9, 14); // month is 0-indexed: 9 = October

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatDateShort(d: Date): string {
  const m = MONTH_NAMES_SHORT[d.getMonth()];
  const day = d.getDate();
  const y = d.getFullYear();
  return `${m} ${day}, ${y}`;
}

export function formatDateRange(start: Date, end: Date): string {
  const startM = MONTH_NAMES_SHORT[start.getMonth()];
  const endM = MONTH_NAMES_SHORT[end.getMonth()];
  const startY = start.getFullYear();
  const endY = end.getFullYear();

  if (start.getTime() === end.getTime()) {
    return formatDateShort(start);
  }

  if (startY === endY) {
    if (startM === endM) {
      return `${startM} ${start.getDate()} - ${end.getDate()}, ${startY}`;
    }
    return `${startM} ${start.getDate()} - ${endM} ${end.getDate()}, ${startY}`;
  }

  return `${startM} ${start.getDate()}, ${startY} - ${endM} ${end.getDate()}, ${endY}`;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------------- DAY CALCULATIONS ----------------
// Max allowed day is strictly yesterday (Oct 13, 2026)
export function getYesterday(): Date {
  const d = new Date(REFERENCE_DATE);
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function createDaySelection(targetDate: Date): DateFilterSelection {
  const d = new Date(targetDate);
  d.setHours(0, 0, 0, 0);

  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);

  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const yesterday = getYesterday();
  const isYesterday = d.getTime() === yesterday.getTime();

  return {
    granularity: 'day',
    label: isYesterday ? `Yesterday (${formatDateShort(d)})` : formatDateShort(d),
    startDate: toISODate(d),
    endDate: toISODate(d),
    displayRange: formatDateShort(d),
    precedingRange: formatDateShort(prev),
    inFocusRange: formatDateShort(d),
    upcomingRange: formatDateShort(next),
  };
}

export function getDayPresets(count = 7): DateFilterSelection[] {
  const presets: DateFilterSelection[] = [];
  const yesterday = getYesterday();

  for (let i = 0; i < count; i++) {
    const d = new Date(yesterday);
    d.setDate(d.getDate() - i);
    presets.push(createDaySelection(d));
  }
  return presets;
}

// ---------------- WEEK CALCULATIONS (Monday to Sunday) ----------------
// Return Monday of the week for date d
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  date.setDate(date.getDate() + diff);
  return date;
}

// Max allowed week is strictly Last Week (Oct 5 - Oct 11, 2026)
export function getLastWeekMonday(): Date {
  // Current date is Oct 14 (Wed). Current week Monday is Oct 12.
  // Last week Monday is Oct 12 - 7 days = Oct 5.
  const currentWeekMonday = getMondayOfWeek(REFERENCE_DATE);
  const lastWeekMonday = new Date(currentWeekMonday);
  lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);
  return lastWeekMonday;
}

export function createWeekSelection(mondayDate: Date): DateFilterSelection {
  const start = new Date(mondayDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Sunday

  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevEnd = new Date(end);
  prevEnd.setDate(prevEnd.getDate() - 7);

  const nextStart = new Date(start);
  nextStart.setDate(nextStart.getDate() + 7);
  const nextEnd = new Date(end);
  nextEnd.setDate(nextEnd.getDate() + 7);

  const lastWeekMon = getLastWeekMonday();
  const isLastWeek = start.getTime() === lastWeekMon.getTime();
  const formattedRange = formatDateRange(start, end);

  return {
    granularity: 'week',
    label: isLastWeek ? `Last week (${formattedRange})` : formattedRange,
    startDate: toISODate(start),
    endDate: toISODate(end),
    displayRange: formattedRange,
    precedingRange: formatDateRange(prevStart, prevEnd),
    inFocusRange: formattedRange,
    upcomingRange: formatDateRange(nextStart, nextEnd),
  };
}

export function getWeekPresets(count = 8): DateFilterSelection[] {
  const presets: DateFilterSelection[] = [];
  const lastWeekMon = getLastWeekMonday();

  for (let i = 0; i < count; i++) {
    const monday = new Date(lastWeekMon);
    monday.setDate(monday.getDate() - (i * 7));
    presets.push(createWeekSelection(monday));
  }
  return presets;
}

// ---------------- MONTH CALCULATIONS ----------------
// Max allowed month is strictly Last Month (September 2026)
export function getLastMonthYearAndMonth(): { year: number; month: number } {
  let year = REFERENCE_DATE.getFullYear();
  let month = REFERENCE_DATE.getMonth() - 1; // 0-indexed
  if (month < 0) {
    month = 11;
    year -= 1;
  }
  return { year, month };
}

export function createMonthSelection(year: number, month: number): DateFilterSelection {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); // last day of month

  const prevStart = new Date(year, month - 1, 1);
  const prevEnd = new Date(year, month, 0);

  const nextStart = new Date(year, month + 1, 1);
  const nextEnd = new Date(year, month + 2, 0);

  const lastM = getLastMonthYearAndMonth();
  const isLastMonth = year === lastM.year && month === lastM.month;
  const monthName = MONTH_NAMES_FULL[month];
  const shortRange = `${MONTH_NAMES_SHORT[month]} 1 - ${MONTH_NAMES_SHORT[month]} ${end.getDate()}, ${year}`;

  return {
    granularity: 'month',
    label: isLastMonth ? `Last month (${monthName} ${year})` : `${monthName} ${year}`,
    startDate: toISODate(start),
    endDate: toISODate(end),
    displayRange: `${monthName} ${year}`,
    precedingRange: formatDateRange(prevStart, prevEnd),
    inFocusRange: shortRange,
    upcomingRange: formatDateRange(nextStart, nextEnd),
  };
}

export function getMonthPresets(count = 9): DateFilterSelection[] {
  const presets: DateFilterSelection[] = [];
  const lastM = getLastMonthYearAndMonth();

  for (let i = 0; i < count; i++) {
    let y = lastM.year;
    let m = lastM.month - i;
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    presets.push(createMonthSelection(y, m));
  }
  return presets;
}

// Default initial selection per granularity
export function getDefaultSelection(granularity: DateFilterGranularity): DateFilterSelection {
  switch (granularity) {
    case 'day':
      return createDaySelection(getYesterday());
    case 'month': {
      const { year, month } = getLastMonthYearAndMonth();
      return createMonthSelection(year, month);
    }
    case 'week':
    default:
      return createWeekSelection(getLastWeekMonday());
  }
}

// Steppers
export function canStepForward(selection: DateFilterSelection): boolean {
  if (selection.granularity === 'day') {
    const cur = new Date(selection.startDate);
    const yesterday = getYesterday();
    return cur.getTime() < yesterday.getTime();
  }
  if (selection.granularity === 'week') {
    const cur = new Date(selection.startDate);
    const lastWeek = getLastWeekMonday();
    return cur.getTime() < lastWeek.getTime();
  }
  if (selection.granularity === 'month') {
    const start = new Date(selection.startDate);
    const lastM = getLastMonthYearAndMonth();
    return !(start.getFullYear() === lastM.year && start.getMonth() === lastM.month);
  }
  return false;
}

export function stepBackward(selection: DateFilterSelection): DateFilterSelection {
  if (selection.granularity === 'day') {
    const cur = new Date(selection.startDate);
    cur.setDate(cur.getDate() - 1);
    return createDaySelection(cur);
  }
  if (selection.granularity === 'week') {
    const cur = new Date(selection.startDate);
    cur.setDate(cur.getDate() - 7);
    return createWeekSelection(cur);
  }
  if (selection.granularity === 'month') {
    const cur = new Date(selection.startDate);
    let y = cur.getFullYear();
    let m = cur.getMonth() - 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    return createMonthSelection(y, m);
  }
  return selection;
}

export function stepForward(selection: DateFilterSelection): DateFilterSelection {
  if (!canStepForward(selection)) return selection;

  if (selection.granularity === 'day') {
    const cur = new Date(selection.startDate);
    cur.setDate(cur.getDate() + 1);
    return createDaySelection(cur);
  }
  if (selection.granularity === 'week') {
    const cur = new Date(selection.startDate);
    cur.setDate(cur.getDate() + 7);
    return createWeekSelection(cur);
  }
  if (selection.granularity === 'month') {
    const cur = new Date(selection.startDate);
    let y = cur.getFullYear();
    let m = cur.getMonth() + 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    return createMonthSelection(y, m);
  }
  return selection;
}

// ---------------- SECTION DAYS EXTRACTION ----------------
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildDayInfo(d: Date, prefix: string, index: number): PeriodDayInfo {
  const dayName = DAY_NAMES_SHORT[d.getDay()];
  const dayNum = String(d.getDate()).padStart(2, '0');
  const m = MONTH_NAMES_SHORT[d.getMonth()];
  return {
    key: `${prefix}-${toISODate(d)}-${index}`,
    dateStr: `${m} ${dayNum}`,
    fullDate: `${dayName}, ${m} ${dayNum}, ${d.getFullYear()}`,
    dayName,
    dayNum,
    isoDate: toISODate(d),
  };
}

export interface SectionDaysResult {
  section1Days: PeriodDayInfo[];
  section2Days: PeriodDayInfo[];
  section3Days: PeriodDayInfo[];
}

export function getSectionDays(selection?: DateFilterSelection): SectionDaysResult {
  const granularity = selection?.granularity || 'week';

  if (granularity === 'day') {
    const center = selection ? new Date(selection.startDate + 'T00:00:00') : getYesterday();
    const prev = new Date(center);
    prev.setDate(prev.getDate() - 1);
    const next = new Date(center);
    next.setDate(next.getDate() + 1);

    return {
      section1Days: [buildDayInfo(prev, 'sec1', 0)],
      section2Days: [buildDayInfo(center, 'sec2', 0)],
      section3Days: [buildDayInfo(next, 'sec3', 0)],
    };
  }

  if (granularity === 'month') {
    // For Month, provide 7 milestone days across the month (Days 1, 5, 10, 15, 20, 25, end-of-month)
    const centerStart = selection ? new Date(selection.startDate + 'T00:00:00') : new Date(2026, 8, 1);
    const y = centerStart.getFullYear();
    const m = centerStart.getMonth();
    
    const prevY = m === 0 ? y - 1 : y;
    const prevM = m === 0 ? 11 : m - 1;
    const nextY = m === 11 ? y + 1 : y;
    const nextM = m === 11 ? 0 : m + 1;

    const sampleDays = [1, 5, 10, 15, 20, 25, 28];
    const section1Days = sampleDays.map((dayNum, i) => buildDayInfo(new Date(prevY, prevM, dayNum), 'sec1', i));
    const section2Days = sampleDays.map((dayNum, i) => buildDayInfo(new Date(y, m, dayNum), 'sec2', i));
    const section3Days = sampleDays.map((dayNum, i) => buildDayInfo(new Date(nextY, nextM, dayNum), 'sec3', i));

    return { section1Days, section2Days, section3Days };
  }

  // Default: WEEK (7 days for each section: Mon to Sun)
  const monday = selection ? new Date(selection.startDate + 'T00:00:00') : getLastWeekMonday();
  monday.setHours(0, 0, 0, 0);

  const prevMonday = new Date(monday);
  prevMonday.setDate(prevMonday.getDate() - 7);

  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  const section1Days: PeriodDayInfo[] = [];
  const section2Days: PeriodDayInfo[] = [];
  const section3Days: PeriodDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d1 = new Date(prevMonday);
    d1.setDate(d1.getDate() + i);
    section1Days.push(buildDayInfo(d1, 'sec1', i));

    const d2 = new Date(monday);
    d2.setDate(d2.getDate() + i);
    section2Days.push(buildDayInfo(d2, 'sec2', i));

    const d3 = new Date(nextMonday);
    d3.setDate(d3.getDate() + i);
    section3Days.push(buildDayInfo(d3, 'sec3', i));
  }

  return { section1Days, section2Days, section3Days };
}

