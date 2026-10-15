import { DashboardItem, PeriodDayInfo, ChauffeurDayMetric, ChauffeurFulfillmentDetail } from '../types';

/**
 * Deterministic hash-based day metric generator for chauffeurs.
 * Respects explicit dayWiseRanks if present, and provides realistic daily recommended & fulfilled counts.
 * Introduces specific 0-booking days so the required 'dot' displays realistically.
 */
export function getChauffeurDayMetric(
  chauffeur: DashboardItem,
  section: 'section1' | 'section2' | 'section3',
  dayIndex: number,
  dayInfo: PeriodDayInfo
): ChauffeurDayMetric {
  const period =
    section === 'section1'
      ? chauffeur.precedingPeriod
      : section === 'section2'
      ? chauffeur.inFocusPeriod
      : chauffeur.upcomingPeriod;

  // Determine Rank
  let rank: 'Top 10' | 'Top 20' | 'Top 50' = 'Top 20';

  if (period?.dayWiseRanks && period.dayWiseRanks[dayIndex]) {
    const r = period.dayWiseRanks[dayIndex].rank;
    if (r === 'Top 10' || r === 'Top 20' || r === 'Top 50') {
      rank = r;
    }
  } else if (period?.rank) {
    if (period.rank === 'Top 10' || period.rank === 'Top 20' || period.rank === 'Top 50') {
      rank = period.rank;
    }
  } else if (chauffeur.tag) {
    rank = chauffeur.tag;
  }

  // Derive stable seed from chauffeur ID and section
  const idNum = parseInt(chauffeur.id.replace(/\D/g, '') || '1', 10);
  const secOffset = section === 'section1' ? 0 : section === 'section2' ? 3 : 7;

  // Pattern for zero-booking days (rest/off days) so dots are displayed
  // For instance, chauffeur 1 takes Sunday (day 6) off; chauffeur 2 takes Wednesday (day 3) and Sunday off, etc.
  const isRestDay = (idNum + dayIndex + secOffset) % 7 === 6 || (idNum % 3 === 0 && dayIndex === 4);

  if (isRestDay) {
    return {
      date: dayInfo.dateStr,
      dayName: dayInfo.dayName,
      rank,
      bookingsRecommended: 0,
      bookingsFulfilled: 0,
    };
  }

  // Generate realistic recommended & fulfilled numbers based on period totals
  const totalRec = period?.bookingsRecommended ?? (chauffeur.totalBookings || 20);
  const totalFul = period?.bookingsFulfilled ?? (chauffeur.bookingFulfilled || 16);

  // Daily average
  const avgRec = Math.max(1, Math.round(totalRec / 6)); // across 6 working days
  const avgFul = Math.max(1, Math.round(totalFul / 6));

  // Small variation based on day
  const variance = ((idNum * 13 + dayIndex * 7 + secOffset) % 3) - 1; // -1, 0, or 1
  const rec = Math.max(1, Math.min(6, avgRec + variance));
  const ful = Math.max(1, Math.min(rec, Math.max(1, avgFul + (variance > 0 ? 1 : 0))));

  const detail: ChauffeurFulfillmentDetail = period?.fulfillmentDetail || {
    bookingsFulfilledOnTime: { count: Math.max(1, ful - 1), suffix: '(+)' },
    dsat: { count: rec > 4 ? 1 : 0, suffix: '(-)' },
    warnings: { count: 0, suffix: '(-)' },
    noShow: { count: 0, suffix: '(--)' },
    happyRating: { count: Math.max(1, Math.round(ful * 0.7)), suffix: '(++)' },
  };

  return {
    date: dayInfo.dateStr,
    dayName: dayInfo.dayName,
    rank,
    bookingsRecommended: rec,
    bookingsFulfilled: ful,
    fulfillmentDetail: detail,
  };
}
