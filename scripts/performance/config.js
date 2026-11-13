// ============================================
// 설정 - 환경변수
// ============================================
const CONFIG = {
  API_KEY: process.env.PSI_API_KEY,
  BASE_URL: process.env.CLIENT_URL,
  WEBHOOK_URL: process.env.CORE_VITAL_WEBHOOK_URL,
  // true면 Discord로 보내지 않고 리포트를 콘솔에 출력한다 (수동 확인용)
  DRY_RUN: process.env.DRY_RUN === 'true',
};

// ============================================
// 실사용자 지표 (CrUX)
// ============================================
const CRUX_API_URL = 'https://chromeuxreport.googleapis.com/v1/records';
const TREND_WEEKS = 4;

// name: 리포트 표기, crux: CrUX API 지표 키, psi: PSI loadingExperience 지표 키
const FIELD_METRICS = [
  {
    name: 'LCP',
    crux: 'largest_contentful_paint',
    psi: 'LARGEST_CONTENTFUL_PAINT_MS',
  },
  {
    name: 'INP',
    crux: 'interaction_to_next_paint',
    psi: 'INTERACTION_TO_NEXT_PAINT',
  },
  {
    name: 'CLS',
    crux: 'cumulative_layout_shift',
    psi: 'CUMULATIVE_LAYOUT_SHIFT_SCORE',
  },
];

const DISCORD_FIELD_VALUE_LIMIT = 1024;

// ============================================
// 측정 그룹
// ============================================
const PAGE_GROUPS = {
  CORE: 'CORE',
  EXPLORE: 'EXPLORE',
  CURATION: 'CURATION',
  DETAIL: 'DETAIL',
};

const GROUP_CONFIG = {
  [PAGE_GROUPS.CORE]: { label: '핵심 진입 화면', icon: '🏠' },
  [PAGE_GROUPS.EXPLORE]: { label: '탐색 화면', icon: '🧭' },
  [PAGE_GROUPS.CURATION]: { label: '시음회&정보', icon: '🥃' },
  [PAGE_GROUPS.DETAIL]: { label: '콘텐츠 상세 샘플', icon: '📄' },
};

// ============================================
// 현재 앱에서 노출되는 고정 측정 페이지
// ============================================
const STATIC_PAGES = [
  { path: '/', label: '홈', group: PAGE_GROUPS.CORE },
  {
    path: '/explore?tab=REVIEW_WHISKEY',
    label: '리뷰 둘러보기',
    group: PAGE_GROUPS.EXPLORE,
  },
  {
    path: '/explore?tab=EXPLORER_WHISKEY',
    label: '위스키 둘러보기',
    group: PAGE_GROUPS.EXPLORE,
  },
  {
    path: '/explore?tab=EXPLORER_WHISKEY&category=SINGLE_MALT',
    label: '싱글몰트 둘러보기',
    group: PAGE_GROUPS.EXPLORE,
  },
  {
    path: '/curation?tab=WHISKY_TASTING_EVENT',
    label: '시음회',
    group: PAGE_GROUPS.CURATION,
  },
  {
    path: '/curation?tab=PROGRAM',
    label: '프로그램',
    group: PAGE_GROUPS.CURATION,
  },
  {
    path: '/curation?tab=RECOMMENDED_WHISKY',
    label: '큐레이션',
    group: PAGE_GROUPS.CURATION,
  },
];

const CURATION_DETAIL_SAMPLES = [
  {
    label: '시음회 상세',
    codes: ['WHISKY_TASTING_EVENT'],
  },
  {
    label: '프로그램 상세',
    codes: ['PROGRAM'],
  },
  {
    label: '큐레이션 상세',
    codes: ['RECOMMENDED_WHISKY', 'WHISKY_PAIRING'],
  },
];

module.exports = {
  CONFIG,
  CRUX_API_URL,
  TREND_WEEKS,
  FIELD_METRICS,
  DISCORD_FIELD_VALUE_LIMIT,
  PAGE_GROUPS,
  GROUP_CONFIG,
  STATIC_PAGES,
  CURATION_DETAIL_SAMPLES,
};
