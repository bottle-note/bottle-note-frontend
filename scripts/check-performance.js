// ============================================
// 설정 - 환경변수
// ============================================
const CONFIG = {
  API_KEY: process.env.PSI_API_KEY,
  BASE_URL: process.env.CLIENT_URL,
  WEBHOOK_URL: process.env.CORE_VITAL_WEBHOOK_URL,
};

// ============================================
// 고정 측정 페이지
// ============================================
const STATIC_PAGES = [
  { path: '/' },
  { path: '/search?category=SINGLE_MALT&sortType=POPULAR&sortOrder=DESC' },
  { path: '/explore?tab=EXPLORER_WHISKEY' },
  { path: '/explore?tab=REVIEW_WHISKEY' },
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
// 동적 페이지 샘플링
// ============================================
async function getSampledPages() {
  const pages = [...STATIC_PAGES];

  const sitemapUrls = await fetchSitemapUrls();

  // /review/* 패턴 필터링 후 랜덤 1개 선택
  const reviewUrls = sitemapUrls.filter((url) => url.includes('/review/'));
  if (reviewUrls.length > 0) {
    const randomReview =
      reviewUrls[Math.floor(Math.random() * reviewUrls.length)];
    const reviewPath = randomReview.replace(CONFIG.BASE_URL, '');
    pages.push({ path: reviewPath });
    console.log(`🎲 랜덤 리뷰 선택: ${reviewPath}`);
  }

  // /search/{category}/{id} 패턴 (위스키 상세) 필터링 후 랜덤 1개 선택
  const alcoholUrls = sitemapUrls.filter((url) => {
    const path = url.replace(CONFIG.BASE_URL, '');
    // /search/Category/123 형태만 매칭 (쿼리 파라미터 제외)
    return /^\/search\/[^/]+\/\d+$/.test(path);
  });
  if (alcoholUrls.length > 0) {
    const randomAlcohol =
      alcoholUrls[Math.floor(Math.random() * alcoholUrls.length)];
    const alcoholPath = randomAlcohol.replace(CONFIG.BASE_URL, '');
    pages.push({ path: alcoholPath });
    console.log(`🎲 랜덤 위스키 선택: ${alcoholPath}`);
  }

  return pages;
}

// ============================================
// PSI API 호출
// ============================================
async function measurePage(url, path) {
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
  const avgScore = Math.round(
    results.reduce((sum, r) => sum + r.score, 0) / results.length,
  );

  // 페이지별 상세 정보
  const pageDetails = results
    .map((r) => {
      const lcpRating = getMetricRating('LCP', r.metrics.LCP.numericValue);
      const clsRating = getMetricRating('CLS', r.metrics.CLS.numericValue);
      const tbtRating = getMetricRating('TBT', r.metrics.TBT.numericValue);

      return [
        `**\`${r.path}\`** ${getRatingEmoji(r.score)} ${r.score}점`,
        `${lcpRating} LCP: ${r.metrics.LCP.value} | ${clsRating} CLS: ${r.metrics.CLS.value} | ${tbtRating} TBT: ${r.metrics.TBT.value}`,
      ].join('\n');
    })
    .join('\n\n');

  return {
    content: `📊 **주간 성능 리포트**가 도착했습니다!`,
    embeds: [
      {
        title: `${getRatingEmoji(avgScore)} 전체 평균: ${avgScore}점`,
        description: `측정 대상: ${CONFIG.BASE_URL}\n측정 페이지: ${results.length}개`,
        color: avgScore >= 90 ? 0x22c55e : avgScore >= 50 ? 0xeab308 : 0xef4444,
        fields: [
          {
            name: '📄 페이지별 성능',
            value: pageDetails,
            inline: false,
          },
        ],
        footer: {
          text: `측정 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} | Mobile 기준`,
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
      const result = await measurePage(url, page.path);
      results.push(result);
      console.log(`   ✅ ${result.score}점\n`);

      // API 레이트 리밋 방지 (2초 대기)
      await delay(2000);
    } catch (error) {
      console.error(`   ❌ 실패: ${error.message}\n`);
      results.push({
        path: page.path,
        url,
        score: 0,
        metrics: {},
        error: error.message,
      });
    }
  }

  // 성공한 결과만 필터
  const successResults = results.filter((r) => r.score > 0);

  if (successResults.length === 0) {
    console.error('❌ 모든 페이지 측정 실패');
    process.exit(1);
  }

  // Discord 메시지 전송
  const payload = buildDiscordMessage(successResults);

  await fetch(CONFIG.WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('✅ 디스코드 알림 전송 완료!');
  console.log(
    `\n📈 평균 점수: ${Math.round(successResults.reduce((s, r) => s + r.score, 0) / successResults.length)}점`,
  );
}

main().catch((error) => {
  console.error('❌ 에러:', error);
  process.exit(1);
});
