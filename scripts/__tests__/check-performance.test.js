/**
 * @jest-environment node
 */
const {
  buildDiscordMessage,
  parseCruxRecord,
  parseCruxHistory,
} = require('../check-performance');

const cruxRecord = (overrides = {}) => ({
  record: {
    metrics: {
      largest_contentful_paint: { percentiles: { p75: 2300 } },
      interaction_to_next_paint: { percentiles: { p75: 180 } },
      cumulative_layout_shift: { percentiles: { p75: '0.05' } },
      ...overrides,
    },
    collectionPeriod: {
      firstDate: { year: 2026, month: 10, day: 12 },
      lastDate: { year: 2026, month: 11, day: 8 },
    },
  },
});

const cruxHistory = {
  record: {
    metrics: {
      largest_contentful_paint: {
        percentilesTimeseries: { p75s: [3000, 2700, 2500, 2400, 2300] },
      },
      interaction_to_next_paint: {
        percentilesTimeseries: { p75s: [null, 200, 190, 185, 180] },
      },
      cumulative_layout_shift: {
        percentilesTimeseries: {
          p75s: ['0.08', '0.07', '0.06', '0.05', '0.05'],
        },
      },
    },
  },
};

const siteField = (record, trend = null) => ({
  origin: 'https://bottle-note.com',
  record,
  trend,
  reason: null,
  trendReason: trend ? null : 'CrUX 추이 조회 실패: blocked',
  failed: false,
});

describe('CrUX 응답 파싱', () => {
  it('사이트 전체 p75와 집계 기간을 읽는다', () => {
    expect(parseCruxRecord(cruxRecord())).toEqual({
      period: { first: '2026-10-12', last: '2026-11-08' },
      values: { LCP: 2300, INP: 180, CLS: 0.05 },
    });
    expect(parseCruxRecord(null)).toBeNull();
  });

  it('추이는 최근 4주만 남긴다', () => {
    expect(parseCruxHistory(cruxHistory)).toEqual({
      LCP: [2700, 2500, 2400, 2300],
      INP: [200, 190, 185, 180],
      CLS: [0.07, 0.06, 0.05, 0.05],
    });
  });
});

describe('buildDiscordMessage', () => {
  it('지표마다 좋음·개선 필요·나쁨을 앞세우고 값과 추이를 붙인다', () => {
    const [embed] = buildDiscordMessage(
      siteField(parseCruxRecord(cruxRecord()), parseCruxHistory(cruxHistory)),
    ).embeds;

    expect(embed.title).toBe('🟢 실사용자 Core Web Vitals (모바일 p75): 좋음');
    expect(embed.description).toContain(
      '🟢 **LCP 좋음** · 2.3s · 추이 2.7s → 2.5s → 2.4s → 2.3s',
    );
    expect(embed.description).toContain('🟢 **INP 좋음** · 180ms');
    expect(embed.description).toContain('🟢 **CLS 좋음** · 0.05');
    expect(embed.footer.text).toContain('집계 2026-10-12 ~ 2026-11-08');
  });

  it('전체 판정은 가장 나쁜 지표를 따른다', () => {
    const record = parseCruxRecord(
      cruxRecord({
        largest_contentful_paint: { percentiles: { p75: 4500 } },
        interaction_to_next_paint: { percentiles: { p75: 300 } },
      }),
    );
    const [embed] = buildDiscordMessage(siteField(record)).embeds;

    expect(embed.title).toBe('🔴 실사용자 Core Web Vitals (모바일 p75): 나쁨');
    expect(embed.description).toContain('🔴 **LCP 나쁨** · 4.5s');
    expect(embed.description).toContain('🟡 **INP 개선 필요** · 300ms');
    expect(embed.footer.text).toContain(
      '추이 없음 (CrUX 추이 조회 실패: blocked)',
    );
  });

  it('실사용자 데이터가 없으면 사유를 담아 보낸다', () => {
    const [embed] = buildDiscordMessage({
      ...siteField(null),
      reason: 'CrUX 조회 실패: Permission denied on the service.',
      failed: true,
    }).embeds;

    expect(embed.title).toContain('⚪');
    expect(embed.description).toContain(
      '사유: CrUX 조회 실패: Permission denied on the service.',
    );
  });
});
