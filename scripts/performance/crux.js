const {
  CONFIG,
  CRUX_API_URL,
  TREND_WEEKS,
  FIELD_METRICS,
} = require('./config');
const { toNumber, formatCruxDate } = require('./metrics');

const readCollectionPeriod = (period) =>
  period
    ? {
        first: formatCruxDate(period.firstDate),
        last: formatCruxDate(period.lastDate),
      }
    : null;

// CrUX queryRecord 응답 → { period, values: { LCP, INP, CLS } }
const parseCruxRecord = (data) => {
  const metrics = data?.record?.metrics;
  if (!metrics) return null;

  const values = {};
  FIELD_METRICS.forEach(({ name, crux }) => {
    const p75 = toNumber(metrics[crux]?.percentiles?.p75);
    if (p75 !== null) values[name] = p75;
  });

  if (Object.keys(values).length === 0) return null;

  return { period: readCollectionPeriod(data.record.collectionPeriod), values };
};

// CrUX queryHistoryRecord 응답 → { LCP: [오래된 값, ..., 최신 값] } (최근 TREND_WEEKS개)
const parseCruxHistory = (data, weeks = TREND_WEEKS) => {
  const metrics = data?.record?.metrics;
  if (!metrics) return null;

  const trend = {};
  FIELD_METRICS.forEach(({ name, crux }) => {
    const p75s = metrics[crux]?.percentilesTimeseries?.p75s;
    if (!Array.isArray(p75s)) return;
    const series = p75s.slice(-weeks).map(toNumber);
    if (series.some((value) => value !== null)) trend[name] = series;
  });

  return Object.keys(trend).length > 0 ? trend : null;
};

async function queryCrux(endpoint, origin) {
  const res = await fetch(`${CRUX_API_URL}:${endpoint}?key=${CONFIG.API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin,
      formFactor: 'PHONE',
      metrics: FIELD_METRICS.map(({ crux }) => crux),
    }),
  });
  const data = await res.json().catch(() => ({}));

  // 404는 오류가 아니라 CrUX에 집계될 만큼 방문 데이터가 없다는 뜻
  if (res.status === 404) {
    return { data: null, reason: 'CrUX에 집계된 데이터 없음' };
  }
  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  return { data, reason: null };
}

const describeMissingRecord = (current) =>
  current.status === 'rejected'
    ? `CrUX 조회 실패: ${current.reason.message}`
    : current.value.reason || 'CrUX 응답에 지표 없음';

const describeMissingTrend = (history) =>
  history.status === 'rejected'
    ? `CrUX 추이 조회 실패: ${history.reason.message}`
    : history.value.reason || 'CrUX 추이 응답에 지표 없음';

async function fetchSiteFieldData(origin) {
  const [current, history] = await Promise.allSettled([
    queryCrux('queryRecord', origin),
    queryCrux('queryHistoryRecord', origin),
  ]);

  const record =
    current.status === 'fulfilled' ? parseCruxRecord(current.value.data) : null;
  const trend =
    history.status === 'fulfilled'
      ? parseCruxHistory(history.value.data)
      : null;

  return {
    origin,
    record,
    trend,
    reason: record ? null : describeMissingRecord(current),
    trendReason: trend ? null : describeMissingTrend(history),
    failed: current.status === 'rejected',
  };
}

module.exports = {
  parseCruxRecord,
  parseCruxHistory,
  queryCrux,
  fetchSiteFieldData,
};
