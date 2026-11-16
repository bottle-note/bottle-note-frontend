const {
  CONFIG,
  TREND_WEEKS,
  FIELD_METRICS,
  DISCORD_FIELD_VALUE_LIMIT,
  PAGE_GROUPS,
  GROUP_CONFIG,
} = require('./config');
const {
  getRatingEmoji,
  getMetricRating,
  formatFieldValue,
  truncate,
  getAverageScore,
} = require('./metrics');

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

module.exports = {
  formatTrend,
  buildFieldEmbed,
  formatPageFieldLine,
  buildDiscordMessage,
  renderPayloadAsText,
};
