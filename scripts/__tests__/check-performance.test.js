/**
 * @jest-environment node
 */
const {
  buildDiscordMessage,
  parsePageFieldMetrics,
  withPsiOriginFallback,
  parseCruxRecord,
  parseCruxHistory,
} = require('../check-performance');

const labResult = (overrides = {}) => ({
  path: '/',
  label: '홈',
  group: 'CORE',
  url: 'https://bottle-note.com/',
  score: 82,
  field: null,
  metrics: {
    LCP: { value: '2.1 s', numericValue: 2100 },
    CLS: { value: '0.01', numericValue: 0.01 },
    TBT: { value: '150 ms', numericValue: 150 },
  },
  ...overrides,
});

const cruxRecord = {
  record: {
    metrics: {
      largest_contentful_paint: { percentiles: { p75: 2300 } },
      interaction_to_next_paint: { percentiles: { p75: 180 } },
      cumulative_layout_shift: { percentiles: { p75: '0.05' } },
    },
    collectionPeriod: {
      firstDate: { year: 2026, month: 10, day: 12 },
      lastDate: { year: 2026, month: 11, day: 8 },
    },
  },
};

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

describe('parsePageFieldMetrics', () => {
  it('PSI loadingExperience의 p75를 읽고 CLS는 100으로 나눈다', () => {
    expect(
      parsePageFieldMetrics({
        metrics: {
          LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2400 },
          INTERACTION_TO_NEXT_PAINT: { percentile: 150 },
          CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 5 },
        },
      }),
    ).toEqual({ LCP: 2400, INP: 150, CLS: 0.05 });
  });

  it('페이지 데이터가 없거나 사이트 전체로 대체된 값이면 null', () => {
    expect(parsePageFieldMetrics(undefined)).toBeNull();
    expect(
      parsePageFieldMetrics({ id: 'https://bottle-note.com/' }),
    ).toBeNull();
    expect(
      parsePageFieldMetrics({
        origin_fallback: true,
        metrics: { LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2400 } },
      }),
    ).toBeNull();
  });
});

describe('withPsiOriginFallback', () => {
  const failedCrux = {
    origin: 'https://bottle-note.com',
    record: null,
    trend: null,
    reason: 'CrUX 조회 실패: blocked',
    trendReason: 'CrUX 추이 조회 실패: blocked',
  };

  it('CrUX API가 실패하면 PSI originLoadingExperience 값으로 사이트 p75를 채운다', () => {
    const siteField = withPsiOriginFallback(failedCrux, [
      labResult({ originField: { LCP: 2600, INP: 210, CLS: 0.03 } }),
    ]);

    expect(siteField.record.values).toEqual({ LCP: 2600, INP: 210, CLS: 0.03 });
    const [field] = buildDiscordMessage([labResult()], siteField).embeds;
    expect(field.description).toContain('🟡 **LCP** 2.6s');
    expect(field.description).toContain('출처: PSI originLoadingExperience');
    expect(field.description).toContain(
      '추이 없음 (CrUX 추이 조회 실패: blocked)',
    );
  });

  it('대체할 값도 없으면 그대로 둔다', () => {
    expect(withPsiOriginFallback(failedCrux, [labResult()])).toBe(failedCrux);
  });
});

describe('CrUX 응답 파싱', () => {
  it('사이트 전체 p75와 집계 기간을 읽는다', () => {
    expect(parseCruxRecord(cruxRecord)).toEqual({
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
  it('실사용자와 실험실을 나눠 보여 주고 사이트 전체 p75와 추이를 담는다', () => {
    const payload = buildDiscordMessage([labResult()], {
      origin: 'https://bottle-note.com',
      record: parseCruxRecord(cruxRecord),
      trend: parseCruxHistory(cruxHistory),
      reason: null,
    });

    const [field, lab] = payload.embeds;
    expect(field.title).toContain('실사용자');
    expect(field.description).toContain(
      '🟢 **LCP** 2.3s · 추이 2.7s → 2.5s → 2.4s → 2.3s',
    );
    expect(field.description).toContain('🟢 **INP** 180ms');
    expect(field.description).toContain('🟢 **CLS** 0.05');
    expect(field.description).toContain('2026-10-12 ~ 2026-11-08');
    expect(lab.title).toContain('실험실');
    expect(lab.fields[0].value).toContain('LCP 2.1 s');
  });

  it('실사용자 데이터가 없어도 실험실 리포트는 그대로 담긴다', () => {
    const payload = buildDiscordMessage([labResult()], {
      record: null,
      trend: null,
      reason: 'CrUX에 집계된 데이터 없음',
    });

    const [field, lab] = payload.embeds;
    expect(field.description).toContain('실사용자 데이터가 없어');
    expect(field.description).toContain('CrUX에 집계된 데이터 없음');
    expect(lab.title).toBe('🧪 실험실 · 🟡 핵심 화면 평균: 82점');
    expect(lab.fields[0].value).not.toContain('👥');
  });

  it('페이지별 실사용자 값은 데이터가 있을 때만 보조 줄로 붙는다', () => {
    const payload = buildDiscordMessage([
      labResult({ field: { LCP: 4500, INP: 300, CLS: 0.02 } }),
    ]);

    expect(payload.embeds[1].fields[0].value).toContain(
      '👥 실사용자 🔴 LCP 4.5s | 🟡 INP 300ms | 🟢 CLS 0.02',
    );
  });
});
