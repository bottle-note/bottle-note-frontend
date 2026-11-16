// Core Web Vitals 공식 기준값 (https://web.dev/articles/vitals)
const METRIC_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
};

const RATINGS = {
  good: { emoji: '🟢', label: '좋음', color: 0x22c55e },
  needsImprovement: { emoji: '🟡', label: '개선 필요', color: 0xeab308 },
  poor: { emoji: '🔴', label: '나쁨', color: 0xef4444 },
};

const RATING_ORDER = ['good', 'needsImprovement', 'poor'];

const rateMetric = (name, value) => {
  const threshold = METRIC_THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needsImprovement';
  return 'poor';
};

const findWorstRating = (ratings) =>
  RATING_ORDER[
    Math.max(...ratings.map((rating) => RATING_ORDER.indexOf(rating)))
  ];

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatMetricValue = (name, value) => {
  if (value === null || value === undefined) return '-';
  if (name === 'CLS') return value.toFixed(2);
  if (name === 'LCP') return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
};

const formatCruxDate = (date) =>
  date
    ? `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    : '';

module.exports = {
  RATINGS,
  rateMetric,
  findWorstRating,
  toNumber,
  formatMetricValue,
  formatCruxDate,
};
