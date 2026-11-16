const CONFIG = {
  API_KEY: process.env.CRUX_API_KEY,
  BASE_URL: process.env.CLIENT_URL,
  WEBHOOK_URL: process.env.CORE_VITAL_WEBHOOK_URL,
  // 수동 실행에서 팀 채널에 보내지 않고 리포트만 확인하기 위한 옵션
  DRY_RUN: process.env.DRY_RUN === 'true',
};

const CRUX_API_URL = 'https://chromeuxreport.googleapis.com/v1/records';
const TREND_WEEKS = 4;

// name: 리포트 표기, crux: CrUX API 지표 키
const FIELD_METRICS = [
  { name: 'LCP', crux: 'largest_contentful_paint' },
  { name: 'INP', crux: 'interaction_to_next_paint' },
  { name: 'CLS', crux: 'cumulative_layout_shift' },
];

module.exports = {
  CONFIG,
  CRUX_API_URL,
  TREND_WEEKS,
  FIELD_METRICS,
};
