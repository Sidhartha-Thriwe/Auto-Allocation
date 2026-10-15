import React from 'react';
import { DashboardItem, PeriodDayInfo } from '../types';
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

export const ChauffeurRankTimeline: React.FC<ChauffeurRankTimelineProps> = ({ items, sections }) => {
  const gridCols = '240px repeat(3, minmax(0, 1fr))';

  return (
    <div style={{ fontFamily: FONT, color: '#1A2230', background: '#FFFFFF' }}>
      {/* Legend bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px 24px',
          padding: '14px 20px',
          borderBottom: '1px solid #EEF1F4',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: '#5B6575' }}>RANK:</span>
          {legendChip('#B7E8CF', '#EDFAF3', '#0B7A47', '#12B76A', 'Top 10 (Green)')}
          {legendChip('#C3D6FB', '#EEF3FE', '#1D4FC4', '#2F6FED', 'Top 20 (Blue)')}
          {legendChip('#F6DE95', '#FEF8E4', '#8A6100', '#F5B301', 'Top 50 (Yellow)')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', fontSize: 12, color: '#5B6575' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#98A2B3' }} />
            Solid dot: no bookings
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                boxSizing: 'border-box',
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

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 1240 }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: '1px solid #E6EAEF' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                padding: '0 20px 10px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: '#5B6575',
                background: '#FAFBFC',
                borderRight: '1px solid #E6EAEF',
              }}
            >
              CHAUFFEUR · VENDOR
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
                    gridTemplateColumns: `repeat(${s.days.length}, minmax(0, 1fr))`,
                    columnGap: BAR_GAP,
                    padding: '0 10px 8px',
                  }}
                >
                  {s.days.map((d) => (
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
                      <span style={{ letterSpacing: '0.04em' }}>{d.dayName.toUpperCase()}</span>
                      <span style={{ fontWeight: 600, color: '#3A4352' }}>{String(parseInt(d.dayNum, 10))}</span>
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
          {items.map((item) => (
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
                        gridTemplateColumns: `repeat(${s.days.length}, minmax(0, 1fr))`,
                        columnGap: BAR_GAP,
                        height: 52,
                        borderBottom: '1px solid #E9EDF2',
                      }}
                    >
                      {s.days.map((d, di) => {
                        const m = getChauffeurDayMetric(item, s.key, di, d);
                        const c = TIERS[m.rank];
                        const rec = m.bookingsRecommended;
                        const ful = Math.min(m.bookingsFulfilled, rec);
                        const [mon] = d.dateStr.split(' ');
                        const dayLabel = `${d.dayName} ${parseInt(d.dayNum, 10)} ${mon}`;
                        const tip =
                          rec === 0
                            ? `${dayLabel} · ${m.rank} · no bookings`
                            : `${dayLabel} · ${m.rank} · ${rec} recommended · ${ful} ${
                                forecast ? 'forecast fulfilled' : 'fulfilled'
                              }`;

                        return (
                          <div
                            key={d.key}
                            title={tip}
                            style={{
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
                                  height: rec * UNIT_HEIGHT,
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
                                    flex: `0 0 ${(rec - ful) * UNIT_HEIGHT}px`,
                                    ...(forecast ? {} : { background: c.tint }),
                                  }}
                                />
                                <div style={{ flex: '1 1 auto', background: forecast ? c.tint : c.solid }} />
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
