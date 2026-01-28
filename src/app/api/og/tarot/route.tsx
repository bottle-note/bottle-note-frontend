import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const CATEGORY_LABELS: Record<string, string> = {
  Fresh: '상큼하고 가벼운',
  Sweet: '달콤하고 부드러운',
  Peat: '스모키하고 깊은',
  Strong: '강렬하고 단단한',
  Balance: '조화로운',
};

const CATEGORY_EMOJI: Record<string, string> = {
  Fresh: '🍋',
  Sweet: '🍯',
  Peat: '🔥',
  Strong: '💪',
  Balance: '⚖️',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const whiskyName = searchParams.get('whisky') || '위스키';
  const category = searchParams.get('category') || 'Balance';
  const cards = searchParams.get('cards')?.split(',') || [];

  const categoryLabel = CATEGORY_LABELS[category] || category;
  const emoji = CATEGORY_EMOJI[category] || '🥃';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(180deg, #1a0a0a 0%, #2a1515 50%, #0a0a0f 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 상단 브랜딩 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 20,
            color: '#ff6b6b',
            fontSize: 24,
            letterSpacing: '0.2em',
          }}
        >
          2026 SPIRITS & SPIRIT
        </div>

        {/* 메인 타이틀 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16,
            fontSize: 64,
          }}
        >
          {emoji}
        </div>

        <div
          style={{
            color: '#ff6b6b',
            fontSize: 20,
            marginBottom: 8,
          }}
        >
          {categoryLabel}
        </div>

        <div
          style={{
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          {whiskyName}
        </div>

        {/* 선택된 카드들 */}
        {cards.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 32,
            }}
          >
            {cards.map((card, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '8px 16px',
                  borderRadius: 20,
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 16,
                }}
              >
                {card}
              </div>
            ))}
          </div>
        )}

        {/* 하단 */}
        <div
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 18,
            marginTop: 20,
          }}
        >
          나의 2026 위스키 운세 결과
        </div>

        <div
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 14,
            marginTop: 12,
          }}
        >
          bottle-note.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
