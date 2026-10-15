import React, { useState, useMemo } from 'react';
import { DashboardItem, PeriodDayInfo, ChauffeurFulfillmentDetail } from '../types';
import { getChauffeurDayMetric } from '../utils/chauffeurChartUtils';

type Tier = 'Top 10' | 'Top 20' | 'Top 50';
type SectionKey = 'section1' | 'section2' | 'section3';

interface ChauffeurRankTimelineProps {
  items: DashboardItem[];
  sections: {
    key: SectionKey;
    label: string;
    days: PeriodDayInfo[];
  }[];
  /** ISO date (YYYY-MM-DD) of the first day of the focused month. When set, the grid switches to weekly columns. */
  monthStart?: string;
}

const TIERS: Record<Tier, { solid: string; tint: string; soft: string }> = {
  'Top 10': { solid: '#12B76A', tint: '#A6EBC9', soft: '#EDFAF3' },
  'Top 20': { solid: '#2F6FED', tint: '#AFC8FA', soft: '#EEF3FE' },
  'Top 50': { solid: '#F5B301', tint: '#FBE19A', soft: '#FEF8E4' },
};

const SECTION_HEAD: Record<SectionKey, { bg: string; text: string }> = {
  section1: { bg: '#F3F5F8', text: '#3A4352' },
  section2: { bg: '#EEF3FE', text: '#1D4FC4' },
  section3: { bg: '#EDFAF3', text: '#0B7A47' },
};

const UNIT_HEIGHT = 6; // px per recommended booking
const BAR_GAP = 2; // px between day bars


const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Col {
  key: string;
  top: string;
  sub: string;
}

interface Cell {
  rank: Tier;
  rec: number;
  ful: number;
  detail?: ChauffeurFulfillmentDetail;
  title: string;
}

// Month view buckets: days 1-7, 8-14, 15-21, 22-28 and 29-end
const monthWeeks = (year: number, month: number) => {
  const dim = new Date(year, month + 1, 0).getDate();
  return [0, 1, 2, 3, 4].map((k) => {
    const a = 1 + k * 7;
    const b = Math.min(a + 6, dim);
    return { k, a, b, range: `${a}\u2013${b}` };
  });
};

const dayInfoFor = (year: number, month: number, day: number): PeriodDayInfo => {
  const d = new Date(year, month, day);
  const dayName = DAY_SHORT[d.getDay()];
  const dayNum = String(day).padStart(2, '0');
  const mon = MONTH_SHORT[month];
  return {
    key: `m-${year}-${month}-${day}`,
    dateStr: `${mon} ${dayNum}`,
    fullDate: `${dayName}, ${mon} ${dayNum}, ${year}`,
    dayName,
    dayNum,
    isoDate: `${year}-${String(month + 1).padStart(2, '0')}-${dayNum}`,
  };
};

const TIER_ORDER: Tier[] = ['Top 10', 'Top 20', 'Top 50'];
const modeRank = (ranks: Tier[]): Tier => {
  const counts: Record<Tier, number> = { 'Top 10': 0, 'Top 20': 0, 'Top 50': 0 };
  ranks.forEach((r) => (counts[r] += 1));
  return TIER_ORDER.reduce((best, t) => (counts[t] > counts[best] ? t : best), TIER_ORDER[0]);
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, sans-serif";

const legendChip = (
  border: string,
  bg: string,
  color: string,
  swatch: string,
  label: string
) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      border: `1px solid ${border}`,
      background: bg,
      borderRadius: 6,
      fontSize: 12,
      color,
    }}
  >
    <span style={{ width: 9, height: 9, borderRadius: 2, background: swatch }} />
    {label}
  </span>
);

export const ChauffeurRankTimeline: React.FC<ChauffeurRankTimelineProps> = ({ items, sections: sectionsProp, monthStart }) => {
  const gridCols = '240px repeat(3, minmax(0, 1fr))';
  const [infoOpen, setInfoOpen] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const monthMode = !!monthStart;

  // Month view: weekly totals per chauffeur for previous / selected / next month
  const monthData = useMemo(() => {
    if (!monthStart) return null;
    const [yy, mm] = monthStart.split('-').map(Number);
    const keys: SectionKey[] = ['section1', 'section2', 'section3'];
    const out: Record<string, Cell[][]> = {};
    let maxRec = 1;
    items.forEach((item) => {
      out[item.id] = keys.map((secKey, si) => {
        const d0 = new Date(yy, mm - 1 + (si - 1), 1);
        const y = d0.getFullYear();
        const mo = d0.getMonth();
        const raw = monthWeeks(y, mo).map((w) => {
          let rec = 0;
          let ful = 0;
          const ranks: Tier[] = [];
          const sum = { on: 0, dsat: 0, warn: 0, noShow: 0, happy: 0 };
          for (let day = w.a; day <= w.b; day++) {
            const m = getChauffeurDayMetric(item, secKey, day - 1, dayInfoFor(y, mo, day));
            rec += m.bookingsRecommended;
            ful += Math.min(m.bookingsFulfilled, m.bookingsRecommended);
            ranks.push(m.rank);
            if (m.fulfillmentDetail) {
              sum.on += m.fulfillmentDetail.bookingsFulfilledOnTime.count;
              sum.dsat += m.fulfillmentDetail.dsat.count;
              sum.warn += m.fulfillmentDetail.warnings.count;
              sum.noShow += m.fulfillmentDetail.noShow.count;
              sum.happy += m.fulfillmentDetail.happyRating.count;
            }
          }
          return { w, rec, ful, ranks, sum };
        });
        const period =
          secKey === 'section1' ? item.precedingPeriod : secKey === 'section2' ? item.inFocusPeriod : item.upcomingPeriod;
        const pd = period?.fulfillmentDetail;
        const totalFul = raw.reduce((a, r) => a + r.ful, 0) || 1;
        return raw.map((r) => {
          // If the chauffeur carries a period-level breakdown, split it across weeks by fulfilled share
          const share = (n: number) => Math.round(n * (r.ful / totalFul));
          const detail: ChauffeurFulfillmentDetail = pd
            ? {
                bookingsFulfilledOnTime: { count: share(pd.bookingsFulfilledOnTime.count), suffix: pd.bookingsFulfilledOnTime.suffix },
                dsat: { count: share(pd.dsat.count), suffix: pd.dsat.suffix },
                warnings: { count: share(pd.warnings.count), suffix: pd.warnings.suffix },
                noShow: { count: share(pd.noShow.count), suffix: pd.noShow.suffix },
                happyRating: { count: share(pd.happyRating.count), suffix: pd.happyRating.suffix },
              }
            : {
                bookingsFulfilledOnTime: { count: r.sum.on, suffix: '(+)' },
                dsat: { count: r.sum.dsat, suffix: '(-)' },
                warnings: { count: r.sum.warn, suffix: '(-)' },
                noShow: { count: r.sum.noShow, suffix: '(--)' },
                happyRating: { count: r.sum.happy, suffix: '(++)' },
              };
          if (r.rec > maxRec) maxRec = r.rec;
          return {
            rank: modeRank(r.ranks),
            rec: r.rec,
            ful: r.ful,
            detail,
            title: `Week ${r.w.k + 1} \u00b7 ${r.w.range} ${MONTH_SHORT[mo]}`,
          };
        });
      });
    });
    return { out, maxRec };
  }, [items, monthStart]);

  // Bars: fixed height per booking in day view, scaled to the busiest week in month view
  const unit = monthMode && monthData ? 48 / monthData.maxRec : UNIT_HEIGHT;

  // Column headers per section
  const sections = sectionsProp.map((sec, si) => {
    let cols: Col[];
    if (monthMode && monthStart) {
      const [yy, mm] = monthStart.split('-').map(Number);
      const d0 = new Date(yy, mm - 1 + (si - 1), 1);
      cols = monthWeeks(d0.getFullYear(), d0.getMonth()).map((w) => ({
        key: `${sec.key}-w${w.k}`,
        top: `WEEK ${w.k + 1}`,
        sub: w.range,
      }));
    } else {
      cols = sec.days.map((d) => ({ key: d.key, top: d.dayName.toUpperCase(), sub: String(parseInt(d.dayNum, 10)) }));
    }
    return { ...sec, cols };
  });

  return (
    <div style={{ fontFamily: FONT, color: '#1A2230', background: '#FFFFFF' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 1240 }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: '1px solid #E6EAEF' }}>
            <div
              style={{
                position: 'relative',
                zIndex: 6,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                padding: '0 20px 8px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: '#5B6575',
                background: '#FAFBFC',
                borderRight: '1px solid #E6EAEF',
              }}
            >
              <span style={{ lineHeight: '18px' }}>CHAUFFEUR · VENDOR</span>
              <button
                type="button"
                onClick={() => setInfoOpen((v) => !v)}
                aria-label="Rank and chart legend"
                aria-expanded={infoOpen}
                style={{
                  boxSizing: 'border-box',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  padding: 0,
                  margin: 0,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  font: 'italic 600 11px/1 Georgia, "Times New Roman", serif',
                  letterSpacing: 0,
                  border: infoOpen ? '1px solid #1A2230' : '1px solid #C9D0D9',
                  background: infoOpen ? '#1A2230' : '#FFFFFF',
                  color: infoOpen ? '#FFFFFF' : '#5B6575',
                }}
              >
                i
              </button>
              {infoOpen && (
                <>
                  <div
                    onClick={() => setInfoOpen(false)}
                    style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 8 }}
                  />
                  <div
                    role="dialog"
                    aria-label="Rank and chart legend"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 12,
                      zIndex: 10,
                      width: 316,
                      boxSizing: 'border-box',
                      padding: 16,
                      background: '#FFFFFF',
                      border: '1px solid #E6EAEF',
                      borderRadius: 12,
                      boxShadow: '0 12px 32px rgba(16, 24, 40, 0.12)',
                      letterSpacing: 0,
                      fontWeight: 400,
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#5B6575', marginBottom: 10 }}>
                      RANK
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                      {legendChip('#B7E8CF', '#EDFAF3', '#0B7A47', '#12B76A', 'Top 10 (Green)')}
                      {legendChip('#C3D6FB', '#EEF3FE', '#1D4FC4', '#2F6FED', 'Top 20 (Blue)')}
                      {legendChip('#F6DE95', '#FEF8E4', '#8A6100', '#F5B301', 'Top 50 (Yellow)')}
                    </div>
                    <div style={{ height: 1, background: '#EEF1F4', margin: '14px 0' }} />
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#5B6575', marginBottom: 10 }}>
                      READING THE BARS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: '#3A4352' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            flexShrink: 0,
                            width: 9,
                            height: 12,
                            borderRadius: '2px 2px 0 0',
                            overflow: 'hidden',
                          }}
                        >
                          <span style={{ flex: 1, background: '#A6EBC9' }} />
                          <span style={{ flex: 1.4, background: '#12B76A' }} />
                        </span>
                        2-stack: lower fulfilled · upper recommended
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ flexShrink: 0, width: 9, display: 'flex', justifyContent: 'center' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#98A2B3' }} />
                        </span>
                        Solid dot: no bookings
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            boxSizing: 'border-box',
                            flexShrink: 0,
                            width: 10,
                            height: 12,
                            border: '1.5px dashed #12B76A',
                            borderRadius: '2px 2px 0 0',
                            background: '#EDFAF3',
                          }}
                        />
                        Dotted: upcoming forecast
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            {sections.map((s, idx) => (
              <div
                key={s.key}
                style={{
                  background: SECTION_HEAD[s.key].bg,
                  borderLeft: idx === 0 ? undefined : '1px solid #E6EAEF',
                }}
              >
                <div
                  style={{
                    padding: '12px 0 8px',
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: SECTION_HEAD[s.key].text,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${s.cols.length}, minmax(0, 1fr))`,
                    columnGap: BAR_GAP,
                    padding: '0 10px 8px',
                  }}
                >
                  {s.cols.map((d) => (
                    <div
                      key={d.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: 10,
                        lineHeight: 1.2,
                        color: '#6B7685',
                      }}
                    >
                      <span style={{ letterSpacing: '0.04em' }}>{d.top}</span>
                      <span style={{ fontWeight: 600, color: '#3A4352' }}>{d.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Chauffeur rows */}
          {items.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: '#98A2B3' }}>
              No chauffeurs match the current filters.
            </div>
          )}
          {items.map((item, ri) => (
            <div
              key={item.id}
              style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: '1px solid #EEF1F4' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minWidth: 0,
                  padding: '0 20px',
                  borderRight: '1px solid #E6EAEF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1A2230',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.name}
                </span>
                {item.partnerName && (
                  <span style={{ fontSize: 12, color: '#6B7685', flexShrink: 0 }}>· {item.partnerName}</span>
                )}
              </div>

              {sections.map((s, si) => {
                const forecast = s.key === 'section3';
                return (
                  <div
                    key={s.key}
                    style={{
                      borderLeft: si === 0 ? undefined : '1px solid #E6EAEF',
                      padding: '8px 10px 10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${s.cols.length}, minmax(0, 1fr))`,
                        columnGap: BAR_GAP,
                        height: 52,
                        borderBottom: '1px solid #E9EDF2',
                      }}
                    >
                      {s.cols.map((col, di) => {
                        let cell: Cell;
                        if (monthMode && monthData) {
                          cell = monthData.out[item.id][si][di];
                        } else {
                          const d = s.days[di];
                          const m = getChauffeurDayMetric(item, s.key, di, d);
                          cell = {
                            rank: m.rank,
                            rec: m.bookingsRecommended,
                            ful: Math.min(m.bookingsFulfilled, m.bookingsRecommended),
                            detail: m.fulfillmentDetail,
                            title: `${d.dayName} ${parseInt(d.dayNum, 10)} ${d.dateStr.split(' ')[0]}`,
                          };
                        }
                        const c = TIERS[cell.rank];
                        const rec = cell.rec;
                        const ful = cell.ful;
                        const dayLabel = cell.title;
                        const key = `${item.id}-${s.key}-${di}`;
                        const isHover = hoverKey === key;
                        const pct = rec > 0 ? Math.round((ful / rec) * 100) : 0;
                        const detail: ChauffeurFulfillmentDetail | undefined = cell.detail;
                        const GOOD = { fontSize: 11, fontWeight: 600, color: '#0B7A47' } as const;
                        const BAD = { fontSize: 11, fontWeight: 600, color: '#C2410C' } as const;
                        const GREY = { fontSize: 11, color: '#98A2B3' } as const;
                        type Row = { label: string; value: string; suffix: string; style: React.CSSProperties };
                        const dash = (label: string): Row => ({ label, value: '\u2014', suffix: '', style: GREY });
                        const rows: Row[] =
                          rec === 0
                            ? []
                            : forecast
                            ? [
                                { label: 'Bookings recommended', value: String(rec), suffix: '', style: GREY },
                                { label: 'Bookings fulfilled (forecast)', value: String(ful), suffix: `(${pct}%)`, style: GREY },
                                dash('Fulfilled on time'),
                                dash('DSAT received'),
                                dash('Warnings received'),
                                dash('No-show occurred'),
                                dash('Happy rating received'),
                              ]
                            : [
                                { label: 'Bookings recommended', value: String(rec), suffix: '', style: GREY },
                                { label: 'Bookings fulfilled', value: String(ful), suffix: `(${pct}%)`, style: GREY },
                                { label: 'Fulfilled on time', value: String(detail?.bookingsFulfilledOnTime.count ?? 0), suffix: detail?.bookingsFulfilledOnTime.suffix ?? '(+)', style: GOOD },
                                { label: 'DSAT received', value: String(detail?.dsat.count ?? 0), suffix: detail?.dsat.suffix ?? '(-)', style: BAD },
                                { label: 'Warnings received', value: String(detail?.warnings.count ?? 0), suffix: detail?.warnings.suffix ?? '(-)', style: BAD },
                                { label: 'No-show occurred', value: String(detail?.noShow.count ?? 0), suffix: detail?.noShow.suffix ?? '(--)', style: BAD },
                                { label: 'Happy rating received', value: String(detail?.happyRating.count ?? 0), suffix: detail?.happyRating.suffix ?? '(++)', style: GOOD },
                              ];
                        const pill = {
                          'Top 10': { b: '#B7E8CF', t: '#0B7A47' },
                          'Top 20': { b: '#C3D6FB', t: '#1D4FC4' },
                          'Top 50': { b: '#F6DE95', t: '#8A6100' },
                        }[cell.rank];
                        const tipPos: React.CSSProperties = {
                          ...(ri < 3 ? { top: 'calc(100% + 6px)' } : { bottom: 'calc(100% + 6px)' }),
                          ...(si === 2 && di >= s.cols.length - 3 ? { right: -6 } : { left: '50%', transform: 'translateX(-50%)' }),
                        };

                        return (
                          <div
                            key={col.key}
                            onMouseEnter={() => setHoverKey(key)}
                            onMouseLeave={() => setHoverKey((k) => (k === key ? null : k))}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-end',
                              height: '100%',
                            }}
                          >
                            {rec === 0 ? (
                              forecast ? (
                                <div
                                  style={{
                                    boxSizing: 'border-box',
                                    width: 9,
                                    height: 9,
                                    marginBottom: 2,
                                    borderRadius: '50%',
                                    border: `1.5px dashed ${c.solid}`,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 7,
                                    height: 7,
                                    marginBottom: 3,
                                    borderRadius: '50%',
                                    background: c.solid,
                                  }}
                                />
                              )
                            ) : (
                              <div
                                style={{
                                  boxSizing: 'border-box',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  width: '100%',
                                  height: rec * unit,
                                  borderRadius: '3px 3px 0 0',
                                  overflow: 'hidden',
                                  ...(forecast
                                    ? {
                                        border: `1.5px dashed ${c.solid}`,
                                        borderBottomStyle: 'solid',
                                        background: c.soft,
                                      }
                                    : {}),
                                }}
                              >
                                <div
                                  style={{
                                    flex: `0 0 ${(rec - ful) * unit}px`,
                                    ...(forecast ? {} : { background: c.tint }),
                                  }}
                                />
                                <div style={{ flex: '1 1 auto', background: forecast ? c.tint : c.solid }} />
                              </div>
                            )}

                            {isHover && (
                              <div
                                style={{
                                  position: 'absolute',
                                  zIndex: 20,
                                  ...tipPos,
                                  boxSizing: 'border-box',
                                  width: 244,
                                  padding: '12px 14px',
                                  background: '#FFFFFF',
                                  border: '1px solid #E6EAEF',
                                  borderRadius: 12,
                                  boxShadow: '0 12px 32px rgba(16, 24, 40, 0.14)',
                                  pointerEvents: 'none',
                                  textAlign: 'left',
                                  whiteSpace: 'normal',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A2230' }}>{dayLabel}</span>
                                  <span
                                    style={{
                                      flexShrink: 0,
                                      padding: '2px 8px',
                                      borderRadius: 6,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      background: c.soft,
                                      border: `1px solid ${pill.b}`,
                                      color: pill.t,
                                    }}
                                  >
                                    {cell.rank}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    marginTop: 2,
                                    fontSize: 11,
                                    color: '#6B7685',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {item.name}
                                  {item.partnerName ? ` \u00b7 ${item.partnerName}` : ''}
                                  {forecast ? ' \u00b7 Forecast' : ''}
                                </div>
                                <div style={{ height: 1, background: '#EEF1F4', margin: '10px 0' }} />
                                {rows.length === 0 ? (
                                  <div style={{ fontSize: 12, color: '#6B7685' }}>No bookings</div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    {rows.map((r) => (
                                      <div
                                        key={r.label}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'baseline',
                                          justifyContent: 'space-between',
                                          gap: 12,
                                          fontSize: 12,
                                          lineHeight: 1.3,
                                        }}
                                      >
                                        <span style={{ color: '#5B6575' }}>{r.label}</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, whiteSpace: 'nowrap' }}>
                                          <span style={{ fontWeight: 600, color: '#1A2230' }}>{r.value}</span>
                                          {r.suffix && <span style={r.style}>{r.suffix}</span>}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
