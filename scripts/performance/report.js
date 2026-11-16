const { TREND_WEEKS, FIELD_METRICS } = require('./config');
const {
  RATINGS,
  rateMetric,
  findWorstRating,
  formatMetricValue,
} = require('./metrics');

const NO_DATA_COLOR = 0x9ca3af;
const REPORT_TITLE = '실사용자 Core Web Vitals (모바일 p75)';

const formatTrend = (name, series) =>
  series && series.length >= 2
    ? ` · 추이 ${series.map((value) => formatMetricValue(name, value)).join(' → ')}`
    : '';

function formatMetricLine(name, value, series) {
  if (value === undefined) return `⚪ **${name}** 데이터 없음`;
  const { emoji, label } = RATINGS[rateMetric(name, value)];
  return `${emoji} **${name} ${label}** · ${formatMetricValue(name, value)}${formatTrend(name, series)}`;
}

function formatFooter({ origin, record, trend, trendReason }) {
  const period = record.period
    ? `집계 ${record.period.first} ~ ${record.period.last}`
    : '최근 28일 집계';
  const trendNote = trend
    ? `추이: 최근 ${TREND_WEEKS}주`
    : `추이 없음${trendReason ? ` (${trendReason})` : ''}`;
  return [origin, period, trendNote, '출처: CrUX'].join(' | ');
}

function buildNoDataEmbed(siteField) {
  return {
    title: `⚪ ${REPORT_TITLE}`,
    description: [
      '이번 주는 실사용자 데이터를 받지 못했습니다.',
      siteField?.reason ? `사유: ${siteField.reason}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
    color: NO_DATA_COLOR,
  };
}

// 세 지표 중 가장 나쁜 판정을 사이트 전체 판정으로 쓴다
const rateOverall = (values) =>
  findWorstRating(
    FIELD_METRICS.filter(({ name }) => values[name] !== undefined).map(
      ({ name }) => rateMetric(name, values[name]),
    ),
  );

function buildFieldEmbed(siteField) {
  if (!siteField?.record) return buildNoDataEmbed(siteField);

  const { values } = siteField.record;
  const overall = RATINGS[rateOverall(values)];

  return {
    title: `${overall.emoji} ${REPORT_TITLE}: ${overall.label}`,
    description: FIELD_METRICS.map(({ name }) =>
      formatMetricLine(name, values[name], siteField.trend?.[name]),
    ).join('\n'),
    color: overall.color,
    footer: { text: formatFooter(siteField) },
  };
}

function buildDiscordMessage(siteField) {
  return {
    content: '📊 **주간 Web Vitals 리포트**가 도착했습니다!',
    embeds: [buildFieldEmbed(siteField)],
  };
}

// DRY_RUN 로그에서 Discord embed를 그대로 읽을 수 있게 펼친다
function renderPayloadAsText(payload) {
  return [
    payload.content,
    ...payload.embeds.map((embed) =>
      [
        `\n== ${embed.title} ==`,
        embed.description,
        embed.footer ? `(${embed.footer.text})` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  ].join('\n');
}

module.exports = {
  buildFieldEmbed,
  buildDiscordMessage,
  renderPayloadAsText,
};
