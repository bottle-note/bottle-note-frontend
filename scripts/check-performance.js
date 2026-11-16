const { CONFIG } = require('./performance/config');
const {
  parseCruxRecord,
  parseCruxHistory,
  fetchSiteFieldData,
} = require('./performance/crux');
const {
  buildDiscordMessage,
  renderPayloadAsText,
} = require('./performance/report');

function printDryRunReport(payload) {
  console.log('\n🧪 DRY_RUN: Discord로 보내지 않고 리포트를 출력합니다.\n');
  console.log(renderPayloadAsText(payload));
  console.log('\n--- payload JSON ---');
  console.log(JSON.stringify(payload, null, 2));
}

async function sendDiscordReport(payload) {
  const res = await fetch(CONFIG.WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Discord 알림 전송 실패: HTTP ${res.status}`);
  }
  console.log('✅ 디스코드 알림 전송 완료!');
}

async function main() {
  const origin = new URL(CONFIG.BASE_URL).origin;
  console.log(`🚀 실사용자 Web Vitals 조회: ${origin}`);

  const siteField = await fetchSiteFieldData(origin);
  console.log(
    siteField.record
      ? `👥 p75: ${JSON.stringify(siteField.record.values)}`
      : `👥 데이터 없음: ${siteField.reason}`,
  );

  const payload = buildDiscordMessage(siteField);
  if (CONFIG.DRY_RUN) printDryRunReport(payload);
  else await sendDiscordReport(payload);

  // 키 권한 문제 같은 조회 오류는 리포트를 보낸 뒤에도 실행을 실패로 남겨 알아챌 수 있게 한다
  if (siteField.failed) {
    throw new Error(siteField.reason);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 에러:', error);
    process.exit(1);
  });
}

module.exports = {
  buildDiscordMessage,
  parseCruxRecord,
  parseCruxHistory,
};
