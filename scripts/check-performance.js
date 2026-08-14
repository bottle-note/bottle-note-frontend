// ============================================
// 설정 - 환경변수
// ============================================
const CONFIG = {
  API_KEY: process.env.PSI_API_KEY,
  BASE_URL: process.env.CLIENT_URL,
  WEBHOOK_URL: process.env.CORE_VITAL_WEBHOOK_URL,
};

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
  };

  const t = thresholds[name];
  if (!t) return '⚪';

  if (value <= t.good) return '🟢';
  if (value <= t.poor) return '🟡';
  return '🔴';
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
function buildDiscordMessage(results) {
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
          ].join('\n');
        })
        .join('\n\n');

      return [
        {
          name: `${icon} ${label} · ${averageLabel}`,
          value,
          inline: false,
        },
      ];
    },
  );

  const title =
    coreAverageScore === null
      ? '🔴 핵심 화면 측정 실패'
      : `${getRatingEmoji(coreAverageScore)} 핵심 화면 평균: ${coreAverageScore}점`;

  return {
    content: `📊 **주간 성능 리포트**가 도착했습니다!`,
    embeds: [
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
          text: `측정 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} | Mobile 기준 | 상세 샘플은 핵심 평균에서 제외`,
        },
      },
    ],
  };
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
      console.log(`   ✅ ${result.score}점\n`);

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

  // Discord 메시지 전송
  const payload = buildDiscordMessage(results);

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

module.exports = { buildDiscordMessage };
