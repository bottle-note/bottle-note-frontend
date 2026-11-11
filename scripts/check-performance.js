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

  const period = data.record.collectionPeriod;
  return {
    period: period
      ? {
          first: formatCruxDate(period.firstDate),
          last: formatCruxDate(period.lastDate),
        }
      : null,
    values,
  };
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

const getAverageScore = (results) => {
  if (results.length === 0) return null;

  return Math.round(
    results.reduce((sum, result) => sum + result.score, 0) / results.length,
  );
};

// ============================================
// Sitemap에서 URL 추출
// ============================================
async function fetchSitemapUrls() {
  try {
    const res = await fetch(`${CONFIG.BASE_URL}/sitemap.xml`);
    const xml = await res.text();

    // <loc> 태그에서 URL 추출
    const matches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
    return matches.map((loc) => loc.replace(/<\/?loc>/g, ''));
  } catch (error) {
    console.warn('⚠️ Sitemap 파싱 실패:', error.message);
    return [];
  }
}

// ============================================
// 공개 큐레이션 피드에서 유형별 상세 샘플 추출
// ============================================
async function fetchCurationDetailPages() {
  const pages = await Promise.all(
    CURATION_DETAIL_SAMPLES.map(async ({ label, codes }) => {
      try {
        const params = new URLSearchParams({ cursor: '0', size: '1' });
        codes.forEach((code) => params.append('code', code));

        const res = await fetch(
          `${CONFIG.BASE_URL}/bottle-api/v2/curations/feed?${params.toString()}`,
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const curationId = data.data?.items?.[0]?.id;

        if (!curationId) {
          return null;
        }

        return {
          path: `/curation/${curationId}`,
          label,
          group: PAGE_GROUPS.DETAIL,
        };
      } catch (error) {
        console.warn(`⚠️ ${label} 샘플 조회 실패:`, error.message);
        return null;
      }
    }),
  );

  return pages.filter(Boolean);
}

// ============================================
// 동적 페이지 샘플링
// ============================================
async function getSampledPages() {
  const pages = [...STATIC_PAGES];

  const [sitemapUrls, curationDetailPages] = await Promise.all([
    fetchSitemapUrls(),
    fetchCurationDetailPages(),
  ]);

  // 상세 페이지는 매주 같은 기준으로 비교할 수 있도록 첫 번째 항목을 선택
  const reviewUrls = sitemapUrls.filter((url) => url.includes('/review/'));
  if (reviewUrls.length > 0) {
    const reviewPath = reviewUrls[0].replace(CONFIG.BASE_URL, '');
    pages.push({
      path: reviewPath,
      label: '리뷰 상세',
      group: PAGE_GROUPS.DETAIL,
    });
    console.log(`📌 리뷰 상세 샘플: ${reviewPath}`);
  }

  // /search/{category}/{id}는 현재 둘러보기에서 사용하는 위스키 상세 경로
  const alcoholUrls = sitemapUrls.filter((url) => {
    const path = url.replace(CONFIG.BASE_URL, '');
    // /search/Category/123 형태만 매칭 (쿼리 파라미터 제외)
    return /^\/search\/[^/]+\/\d+$/.test(path);
  });
  if (alcoholUrls.length > 0) {
    const alcoholPath = alcoholUrls[0].replace(CONFIG.BASE_URL, '');
    pages.push({
      path: alcoholPath,
      label: '위스키 상세',
      group: PAGE_GROUPS.DETAIL,
    });
    console.log(`📌 위스키 상세 샘플: ${alcoholPath}`);
  }

  pages.push(...curationDetailPages);

  return pages;
}

// ============================================
// CrUX API 호출 (사이트 전체, 모바일)
// ============================================
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

  // 404는 CrUX에 집계될 만큼 방문 데이터가 없다는 뜻
  if (res.status === 404) {
    return { data: null, reason: 'CrUX에 집계된 데이터 없음' };
  }
  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  return { data, reason: null };
}

// CrUX API로 현재 값을 못 받으면 같은 원천인 PSI originLoadingExperience로 대체한다 (추이는 없음)
function withPsiOriginFallback(siteField, results) {
  if (siteField.record) return siteField;

  const originValues = results.find(
    (result) => result.originField,
  )?.originField;
  if (!originValues) return siteField;

  return {
    ...siteField,
    record: { period: null, values: originValues },
    source: 'PSI originLoadingExperience',
  };
}

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

  let reason = null;
  if (!record) {
    reason =
      current.status === 'rejected'
        ? `CrUX 조회 실패: ${current.reason.message}`
        : current.value.reason || 'CrUX 응답에 지표 없음';
  }
  if (history.status === 'rejected') {
    console.warn('⚠️ CrUX 추이 조회 실패:', history.reason.message);
  }

  const trendReason =
    history.status === 'rejected'
      ? `CrUX 추이 조회 실패: ${history.reason.message}`
      : trend
        ? null
        : history.value.reason || 'CrUX 추이 응답에 지표 없음';

  return { origin, record, trend, reason, trendReason, source: 'CrUX API' };
}

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

// ============================================
// Discord 메시지 생성
// ============================================
const RATING_COLORS = { '🟢': 0x22c55e, '🟡': 0xeab308, '🔴': 0xef4444 };
const NO_DATA_COLOR = 0x9ca3af;

function formatTrend(name, series) {
  if (!series || series.length < 2) return '';
  return ` · 추이 ${series.map((value) => formatFieldValue(name, value)).join(' → ')}`;
}

function buildFieldEmbed(siteField) {
  const title = '👥 실사용자 · 사이트 전체 모바일 p75';

  if (!siteField?.record) {
    return {
      title,
      description: [
        '실사용자 데이터가 없어 이번 주는 실험실 값만 보냅니다.',
        siteField?.reason ? `사유: ${siteField.reason}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      color: NO_DATA_COLOR,
    };
  }

  const { record, trend, origin, source, trendReason } = siteField;
  const ratings = [];
  const lines = FIELD_METRICS.map(({ name }) => {
    const value = record.values[name];
    if (value === undefined) return `⚪ **${name}** 데이터 없음`;
    const rating = getMetricRating(name, value);
    ratings.push(rating);
    return `${rating} **${name}** ${formatFieldValue(name, value)}${formatTrend(name, trend?.[name])}`;
  });

  const worst = ratings.includes('🔴')
    ? '🔴'
    : ratings.includes('🟡')
      ? '🟡'
      : '🟢';
  const period = record.period
    ? `집계 기간: ${record.period.first} ~ ${record.period.last}`
    : '최근 28일 집계';

  return {
    title,
    description: [
      ...lines,
      '',
      [`대상: ${origin}`, period, source ? `출처: ${source}` : null]
        .filter(Boolean)
        .join(' | '),
      trend
        ? `추이: 최근 ${TREND_WEEKS}주, 주 단위 28일 집계`
        : `추이 없음${trendReason ? ` (${trendReason})` : ''}`,
    ]
      .filter((line) => line !== null)
      .join('\n'),
    color: RATING_COLORS[worst],
  };
}

function formatPageFieldLine(field) {
  if (!field) return null;
  const parts = FIELD_METRICS.filter(
    ({ name }) => field[name] !== undefined,
  ).map(
    ({ name }) =>
      `${getMetricRating(name, field[name])} ${name} ${formatFieldValue(name, field[name])}`,
  );
  return `👥 실사용자 ${parts.join(' | ')}`;
}

function buildDiscordMessage(results, siteField = null) {
  const successfulResults = results.filter((result) => !result.error);
  const coreResults = successfulResults.filter(
    (result) => result.group !== PAGE_GROUPS.DETAIL,
  );
  const coreAverageScore = getAverageScore(coreResults);

  const fields = Object.entries(GROUP_CONFIG).flatMap(
    ([group, { label, icon }]) => {
      const groupResults = results.filter((result) => result.group === group);

      if (groupResults.length === 0) {
        return [];
      }

      const groupSuccessfulResults = groupResults.filter(
        (result) => !result.error,
      );
      const groupAverageScore = getAverageScore(groupSuccessfulResults);
      const averageLabel =
        groupAverageScore === null
          ? '측정 실패'
          : `평균 ${groupAverageScore}점`;

      const value = groupResults
        .map((result) => {
          if (result.error) {
            return [
              `**${result.label}** ❌ 측정 실패`,
              `\`${result.path}\``,
            ].join('\n');
          }

          const lcpRating = getMetricRating(
            'LCP',
            result.metrics.LCP.numericValue,
          );
          const clsRating = getMetricRating(
            'CLS',
            result.metrics.CLS.numericValue,
          );
          const tbtRating = getMetricRating(
            'TBT',
            result.metrics.TBT.numericValue,
          );

          return [
            `**${result.label}** ${getRatingEmoji(result.score)} ${result.score}점`,
            `\`${result.path}\``,
            `${lcpRating} LCP ${result.metrics.LCP.value} | ${clsRating} CLS ${result.metrics.CLS.value} | ${tbtRating} TBT ${result.metrics.TBT.value}`,
            formatPageFieldLine(result.field),
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');

      return [
        {
          name: `${icon} ${label} · ${averageLabel}`,
          value: truncate(value, DISCORD_FIELD_VALUE_LIMIT),
          inline: false,
        },
      ];
    },
  );

  const title =
    coreAverageScore === null
      ? '🧪 실험실 · 🔴 핵심 화면 측정 실패'
      : `🧪 실험실 · ${getRatingEmoji(coreAverageScore)} 핵심 화면 평균: ${coreAverageScore}점`;

  return {
    content: `📊 **주간 성능 리포트**가 도착했습니다!`,
    embeds: [
      buildFieldEmbed(siteField),
      {
        title,
        description: `측정 대상: ${CONFIG.BASE_URL}\n고정 화면: ${results.length - results.filter((result) => result.group === PAGE_GROUPS.DETAIL).length}개 | 상세 샘플: ${results.filter((result) => result.group === PAGE_GROUPS.DETAIL).length}개`,
        color:
          coreAverageScore !== null && coreAverageScore >= 90
            ? 0x22c55e
            : coreAverageScore !== null && coreAverageScore >= 50
              ? 0xeab308
              : 0xef4444,
        fields,
        footer: {
          text: `측정 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} | Mobile Lighthouse 기준 | 상세 샘플은 핵심 평균에서 제외 | 👥 줄은 페이지 실사용자 데이터가 있을 때만 표시`,
        },
      },
    ],
  };
}

// DRY_RUN 출력용: Discord embed를 읽을 수 있는 텍스트로 펼친다
function renderPayloadAsText(payload) {
  return [
    payload.content,
    ...payload.embeds.map((embed) =>
      [
        `\n== ${embed.title} ==`,
        embed.description,
        ...(embed.fields || []).map(
          (field) => `\n# ${field.name}\n${field.value}`,
        ),
        embed.footer ? `\n(${embed.footer.text})` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  ].join('\n');
}

// ============================================
// 메인 실행
// ============================================
async function main() {
  console.log('🚀 성능 측정 시작...\n');

  // 정적 페이지 + sitemap에서 샘플링
  const pages = await getSampledPages();
  console.log(`\n📋 총 ${pages.length}개 페이지 측정 예정\n`);

  const results = [];

  for (const page of pages) {
    const url = `${CONFIG.BASE_URL}${page.path}`;
    console.log(`📊 측정 중: ${page.path}`);

    try {
      const result = await measurePage(url, page);
      results.push(result);
      console.log(
        `   ✅ ${result.score}점 | 실사용자(loadingExperience): ${result.fieldStatus}\n`,
      );

      // API 레이트 리밋 방지 (2초 대기)
      await delay(2000);
    } catch (error) {
      console.error(`   ❌ 실패: ${error.message}\n`);
      results.push({
        path: page.path,
        label: page.label,
        group: page.group,
        url,
        score: 0,
        metrics: {},
        error: error.message,
      });
    }
  }

  // 성공한 결과만 필터
  const successResults = results.filter((result) => !result.error);

  if (successResults.length === 0) {
    console.error('❌ 모든 페이지 측정 실패');
    process.exit(1);
  }

  // 실사용자 데이터는 실패해도 실험실 리포트는 보낸다
  const origin = new URL(CONFIG.BASE_URL).origin;
  const cruxField = await fetchSiteFieldData(origin).catch((error) => ({
    origin,
    record: null,
    trend: null,
    reason: `CrUX 조회 실패: ${error.message}`,
  }));
  const siteField = withPsiOriginFallback(cruxField, successResults);
  console.log(
    siteField.record
      ? `👥 사이트 전체 실사용자 p75 (${siteField.source}): ${JSON.stringify(siteField.record.values)}`
      : `👥 실사용자 데이터 없음: ${siteField.reason}`,
  );

  // Discord 메시지 전송
  const payload = buildDiscordMessage(results, siteField);

  if (CONFIG.DRY_RUN) {
    console.log('\n🧪 DRY_RUN: Discord로 보내지 않고 리포트를 출력합니다.\n');
    console.log(renderPayloadAsText(payload));
    console.log('\n--- payload JSON ---');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const webhookResponse = await fetch(CONFIG.WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!webhookResponse.ok) {
    throw new Error(`Discord 알림 전송 실패: HTTP ${webhookResponse.status}`);
  }

  console.log('✅ 디스코드 알림 전송 완료!');
  const coreAverageScore = getAverageScore(
    successResults.filter((result) => result.group !== PAGE_GROUPS.DETAIL),
  );
  const coreAverageLabel =
    coreAverageScore === null ? '측정 실패' : `${coreAverageScore}점`;
  console.log(`\n📈 핵심 화면 평균 점수: ${coreAverageLabel}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 에러:', error);
    process.exit(1);
  });
}

module.exports = {
  buildDiscordMessage,
  parsePageFieldMetrics,
  withPsiOriginFallback,
  parseCruxRecord,
  parseCruxHistory,
};
