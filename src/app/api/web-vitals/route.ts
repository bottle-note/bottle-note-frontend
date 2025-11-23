import { NextResponse } from 'next/server';

const METRIC_NAMES = ['FCP', 'TTFB', 'LCP', 'CLS', 'FID', 'INP'] as const;
const METRIC_NAME_SET = new Set<string>(METRIC_NAMES);

const RATING_COLORS: Record<string, number> = {
  good: 0x22c55e,
  'needs-improvement': 0xeab308,
  poor: 0xef4444,
};

type MetricName = (typeof METRIC_NAMES)[number];

type MetricPayload = {
  id: string;
  name: MetricName;
  label: string;
  value: number;
  delta: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  page: string;
  url: string;
  locale?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: number;
};

const roundValue = (name: MetricName, value: number) => {
  const digits = name === 'CLS' ? 3 : name === 'FID' || name === 'INP' ? 0 : 1;
  return value.toFixed(digits);
};

const getFallbackRating = (
  name: MetricName,
  value: number,
): NonNullable<MetricPayload['rating']> => {
  switch (name) {
    case 'CLS':
      if (value <= 0.1) return 'good';
      if (value <= 0.25) return 'needs-improvement';
      return 'poor';
    case 'LCP':
      if (value <= 2500) return 'good';
      if (value <= 4000) return 'needs-improvement';
      return 'poor';
    case 'INP':
      if (value <= 200) return 'good';
      if (value <= 500) return 'needs-improvement';
      return 'poor';
    case 'FID':
      if (value <= 100) return 'good';
      if (value <= 300) return 'needs-improvement';
      return 'poor';
    case 'FCP':
      if (value <= 1800) return 'good';
      if (value <= 3000) return 'needs-improvement';
      return 'poor';
    case 'TTFB':
    default:
      if (value <= 800) return 'good';
      if (value <= 1800) return 'needs-improvement';
      return 'poor';
  }
};

const isMetricPayload = (payload: unknown): payload is MetricPayload => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    METRIC_NAME_SET.has(data.name) &&
    typeof data.label === 'string' &&
    typeof data.value === 'number' &&
    Number.isFinite(data.value) &&
    typeof data.delta === 'number' &&
    Number.isFinite(data.delta) &&
    typeof data.page === 'string' &&
    typeof data.url === 'string' &&
    typeof data.timestamp === 'number'
  );
};

const buildDiscordBody = (metric: MetricPayload) => {
  const rating = metric.rating ?? getFallbackRating(metric.name, metric.value);
  const color = RATING_COLORS[rating] ?? RATING_COLORS['needs-improvement'];
  const description = [
    `• Value: ${roundValue(metric.name, metric.value)}`,
    `• Delta: ${roundValue(metric.name, metric.delta)}`,
    `• Rating: ${rating}`,
    `• Page: ${metric.page}`,
    metric.locale ? `• Locale: ${metric.locale}` : null,
    metric.sessionId ? `• Session: ${metric.sessionId}` : null,
  ].filter(Boolean);

  return {
    content: `📊 Core Web Vitals – ${metric.name}`,
    embeds: [
      {
        title: `${metric.name} (${rating})`,
        description: description.join('\n'),
        color,
        url: metric.url,
        footer: {
          text: metric.label,
        },
        timestamp: new Date(metric.timestamp).toISOString(),
        fields: metric.userAgent
          ? [
              {
                name: 'User Agent',
                value: metric.userAgent.slice(0, 256),
              },
            ]
          : [],
      },
    ],
  };
};

// FIXME: env 로 등록
const webhookUrl =
  'https://discord.com/api/webhooks/1441838856981712969/blg5WGjjLuLAsLd0LE55iG0gEjMcmtB3SgWLTddBm88vyHQwnekL8MAQCjGDOyt018Y3';

export async function POST(request: Request) {
  if (!webhookUrl) {
    console.error('DISCORD_WEB_VITALS_WEBHOOK_URL is missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: 'Invalid JSON payload' },
      { status: 400 },
    );
  }

  if (!isMetricPayload(payload)) {
    return NextResponse.json(
      { ok: false, message: 'Invalid metric payload' },
      { status: 422 },
    );
  }

  const discordBody = buildDiscordBody(payload);
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(discordBody),
  });

  if (!response.ok) {
    console.error('Failed to deliver web vital metric', await response.text());
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
