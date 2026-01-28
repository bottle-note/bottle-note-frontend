import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '나의 2026 위스키 운세';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          🔮
        </div>

        <div
          style={{
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          나의 2026 위스키 운세
        </div>

        <div
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 24,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          타로 카드로 알아보는 나에게 어울리는 위스키
        </div>

        {/* 카드 미리보기 */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 80,
                height: 120,
                background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
                borderRadius: 8,
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
              }}
            >
              🃏
            </div>
          ))}
        </div>

        {/* 하단 */}
        <div
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 18,
          }}
        >
          지금 바로 운세를 확인해보세요
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
      ...size,
    },
  );
}
