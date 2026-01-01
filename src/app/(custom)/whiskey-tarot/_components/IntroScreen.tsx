'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 페이드인 애니메이션을 위한 딜레이
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" />

      {/* 별 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* 타이틀 */}
        <div className="mb-4">
          <span className="text-mainCoral text-sm tracking-[0.3em] uppercase">
            2026 Whiskey Tarot
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
          당신의 2026년을
          <br />
          위로할 위스키는?
        </h1>

        <p className="text-white/70 text-sm mb-12 max-w-[280px]">
          타로 카드를 뽑아
          <br />
          올해의 위스키를 추천받아 보세요
        </p>

        {/* 카드 미리보기 이미지 */}
        <div className="relative w-40 h-56 mb-12">
          {/* 카드 뒷면 스택 효과 (빈티지 타로 스타일) */}
          <div className="absolute inset-0 transform rotate-[-8deg] opacity-60">
            <div className="w-full h-full rounded-xl bg-[#f4e4c1] p-2 shadow-lg">
              <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#c9a227]/30">
                <Image
                  src="/images/tarot/card-back.png"
                  alt="타로 카드"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 transform rotate-[-4deg] opacity-80">
            <div className="w-full h-full rounded-xl bg-[#f4e4c1] p-2 shadow-lg">
              <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#c9a227]/30">
                <Image
                  src="/images/tarot/card-back.png"
                  alt="타로 카드"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-0">
            <div className="w-full h-full rounded-xl bg-[#f4e4c1] p-2 shadow-2xl">
              <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#c9a227]/30">
                <Image
                  src="/images/tarot/card-back.png"
                  alt="타로 카드"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={onStart}
          className="px-12 py-4 bg-gradient-to-r from-mainCoral to-subCoral text-white font-semibold rounded-full shadow-lg shadow-mainCoral/30 hover:shadow-mainCoral/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          카드 뽑으러 가기
        </button>
      </div>

      {/* 하단 안내 */}
      <p className="absolute bottom-8 text-gray-500 text-xs">Bottle Note</p>
    </div>
  );
}
