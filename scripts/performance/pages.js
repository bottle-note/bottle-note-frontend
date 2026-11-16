const {
  CONFIG,
  PAGE_GROUPS,
  STATIC_PAGES,
  CURATION_DETAIL_SAMPLES,
} = require('./config');

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

module.exports = {
  fetchSitemapUrls,
  fetchCurationDetailPages,
  getSampledPages,
};
