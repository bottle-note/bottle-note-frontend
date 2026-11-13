const { CONFIG, PAGE_GROUPS } = require('./performance/config');
const { delay, getAverageScore } = require('./performance/metrics');
const { getSampledPages } = require('./performance/pages');
const { measurePage, parsePageFieldMetrics } = require('./performance/psi');
const {
  parseCruxRecord,
  parseCruxHistory,
  withPsiOriginFallback,
  fetchSiteFieldData,
} = require('./performance/crux');
const {
  buildDiscordMessage,
  renderPayloadAsText,
} = require('./performance/report');

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
