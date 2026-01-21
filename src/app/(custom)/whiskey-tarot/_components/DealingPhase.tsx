'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { TarotCard } from '../_types';

interface DealingPhaseProps {
  cards: TarotCard[];
  onComplete: () => void;
}

// 덱 레이어 설정 (두꺼운 카드 덱 느낌)
const DECK_LAYERS = Array.from({ length: 8 }, (_, i) => ({
  offsetX: -i * 0.5,
  offsetY: i * 1.5,
  opacity: 1 - i * 0.08,
}));

// 부채꼴 위치 계산
const getFanPosition = (index: number, total: number = 10) => {
  const arcAngle = 120; // 부채꼴 전체 각도
  const radius = 140; // 반지름 (모바일 기준)
  const startAngle = 270 - arcAngle / 2; // 시작 각도 (210도)
  const angleStep = arcAngle / (total - 1);
  const angle = startAngle + index * angleStep;
  const rad = (angle * Math.PI) / 180;

  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius + 100, // 아래로 오프셋
    rotation: angle - 270, // -60 ~ +60
  };
};

export default function DealingPhase({ cards, onComplete }: DealingPhaseProps) {
  const [dealtCount, setDealtCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // 카드 뽑기 애니메이션 시퀀스
  useEffect(() => {
    const dealTimers: NodeJS.Timeout[] = [];

    // 0.5초 후부터 카드 뽑기 시작
    cards.forEach((_, index) => {
      const timer = setTimeout(
        () => {
          setDealtCount(index + 1);
        },
        500 + index * 180,
      ); // 0.18초 간격으로 카드 뽑기
      dealTimers.push(timer);
    });

    // 모든 카드 뽑힌 후 메시지 표시
    const messageTimer = setTimeout(
      () => {
        setShowMessage(true);
      },
      500 + cards.length * 180 + 300,
    );

    // 자동 전환
    const completeTimer = setTimeout(
      () => {
        setIsExiting(true);
        setTimeout(onComplete, 500);
      },
      500 + cards.length * 180 + 1500,
    );

    return () => {
      dealTimers.forEach(clearTimeout);
      clearTimeout(messageTimer);
      clearTimeout(completeTimer);
    };
  }, [cards, onComplete]);

  // 미리 계산된 부채꼴 위치
  const fanPositions = useMemo(
    () => cards.map((_, index) => getFanPosition(index, cards.length)),
    [cards],
  );

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center min-h-screen px-4 py-8
        transition-opacity duration-500
        ${isExiting ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]" />

      {/* 제목 */}
      <div className="relative z-10 text-center mb-8">
        <h2 className="text-white text-xl font-bold mb-2">
          {showMessage ? '카드를 선택해주세요' : '카드를 뽑고 있습니다...'}
        </h2>
        <p className="text-white/60 text-sm">
          {showMessage
            ? '3장의 카드를 골라주세요'
            : `${dealtCount}/${cards.length}장`}
        </p>
      </div>

      {/* 카드 영역 */}
      <div className="relative z-10 w-full max-w-md h-[400px] flex items-center justify-center">
        {/* 카드 덱 (남은 카드) */}
        <div
          className={`
            absolute transition-all duration-500
            ${dealtCount >= cards.length ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}
          `}
          style={{ top: '30px' }}
        >
          {DECK_LAYERS.map((layer, index) => (
            <div
              key={index}
              className="absolute w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-[#f4e4c1] shadow-lg"
              style={{
                transform: `translate(${layer.offsetX}px, ${layer.offsetY}px)`,
                opacity: layer.opacity,
                zIndex: DECK_LAYERS.length - index,
              }}
            >
              <div className="w-full h-full rounded-lg overflow-hidden border border-[#c9a227]/30 p-1">
                <div className="relative w-full h-full rounded overflow-hidden">
                  <Image
                    src="/images/tarot/card-back.png"
                    alt="카드 뒷면"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 뽑힌 카드들 (부채꼴) */}
        <div
          className="absolute w-full h-full"
          style={{ top: '80px', left: '50%', transform: 'translateX(-50%)' }}
        >
          {cards.map((card, index) => {
            const isDealt = index < dealtCount;
            const fanPos = fanPositions[index];

            return (
              <div
                key={card.id}
                className="absolute left-1/2 top-0 w-14 h-20 sm:w-16 sm:h-24 transition-all duration-500 ease-out"
                style={{
                  transform: isDealt
                    ? `translate(calc(-50% + ${fanPos.x}px), ${fanPos.y}px) rotate(${fanPos.rotation}deg)`
                    : 'translate(-50%, -120px) rotate(0deg) scale(0.8)',
                  opacity: isDealt ? 1 : 0,
                  transformOrigin: 'bottom center',
                  zIndex: isDealt ? index + 10 : 0,
                }}
              >
                <div className="w-full h-full rounded-lg bg-[#f4e4c1] shadow-md p-0.5 sm:p-1">
                  <div className="relative w-full h-full rounded overflow-hidden border border-[#c9a227]/30">
                    <Image
                      src="/images/tarot/card-back.png"
                      alt="타로 카드"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 인디케이터 */}
      <div className="relative z-10 flex gap-1.5 mt-4">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index < dealtCount ? 'bg-mainCoral' : 'bg-white/20'}
            `}
          />
        ))}
      </div>
    </div>
  );
}
