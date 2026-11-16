// ============================================
// 유틸리티 함수
// ============================================
const getRatingEmoji = (score) => {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
};

const getMetricRating = (name, value) => {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    CLS: { good: 0.1, poor: 0.25 },
    TBT: { good: 200, poor: 600 },
    INP: { good: 200, poor: 500 },
  };

  const t = thresholds[name];
  if (!t) return '⚪';

  if (value <= t.good) return '🟢';
  if (value <= t.poor) return '🟡';
  return '🔴';
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatFieldValue = (name, value) => {
  if (value === null || value === undefined) return '-';
  if (name === 'CLS') return value.toFixed(2);
  if (name === 'LCP') return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
};

const formatCruxDate = (date) =>
  date
    ? `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    : '';

const truncate = (text, limit) =>
  text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;

const getAverageScore = (results) => {
  if (results.length === 0) return null;

  return Math.round(
    results.reduce((sum, result) => sum + result.score, 0) / results.length,
  );
};

module.exports = {
  getRatingEmoji,
  getMetricRating,
  delay,
  toNumber,
  formatFieldValue,
  formatCruxDate,
  truncate,
  getAverageScore,
};
