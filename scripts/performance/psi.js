const { CONFIG, FIELD_METRICS } = require('./config');
const { toNumber } = require('./metrics');

// PSI loadingExperience/originLoadingExperience → { LCP, INP, CLS } (값이 없으면 null)
const parseLoadingExperienceMetrics = (loadingExperience) => {
  if (!loadingExperience?.metrics) return null;

  const values = {};
  FIELD_METRICS.forEach(({ name, psi }) => {
    const percentile = toNumber(loadingExperience.metrics[psi]?.percentile);
    if (percentile === null) return;
    // PSI는 CLS p75를 100배 정수로 준다 (예: 5 → 0.05)
    values[name] = name === 'CLS' ? percentile / 100 : percentile;
  });

  return Object.keys(values).length > 0 ? values : null;
};

// origin_fallback이면 페이지 값이 아니라 사이트 전체 값이므로 페이지별 값으로 쓰지 않는다
const parsePageFieldMetrics = (loadingExperience) =>
  loadingExperience?.origin_fallback
    ? null
    : parseLoadingExperienceMetrics(loadingExperience);

const describeLoadingExperience = (loadingExperience) => {
  if (!loadingExperience?.metrics) return '없음';
  if (loadingExperience.origin_fallback)
    return '페이지 데이터 없음(사이트 전체로 대체됨)';
  return '있음';
};

// ============================================
// PSI API 호출
// ============================================
async function measurePage(url, page) {
  const { path, label, group } = page;
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${CONFIG.API_KEY}&strategy=mobile&category=performance`;

  const res = await fetch(apiUrl);
  const data = await res.json();

  if (data.error) {
    throw new Error(`${path}: ${data.error.message}`);
  }

  const lighthouse = data.lighthouseResult;
  const score = Math.round(lighthouse.categories.performance.score * 100);
  const metrics = lighthouse.audits;

  return {
    path,
    label,
    group,
    url,
    score,
    field: parsePageFieldMetrics(data.loadingExperience),
    originField: parseLoadingExperienceMetrics(data.originLoadingExperience),
    fieldStatus: describeLoadingExperience(data.loadingExperience),
    metrics: {
      LCP: {
        value: metrics['largest-contentful-paint'].displayValue,
        numericValue: metrics['largest-contentful-paint'].numericValue,
      },
      CLS: {
        value: metrics['cumulative-layout-shift'].displayValue,
        numericValue: metrics['cumulative-layout-shift'].numericValue,
      },
      TBT: {
        value: metrics['total-blocking-time'].displayValue,
        numericValue: metrics['total-blocking-time'].numericValue,
      },
    },
  };
}

module.exports = {
  parseLoadingExperienceMetrics,
  parsePageFieldMetrics,
  describeLoadingExperience,
  measurePage,
};
