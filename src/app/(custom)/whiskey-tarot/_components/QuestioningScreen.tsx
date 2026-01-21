'use client';

import { useEffect, useState } from 'react';

interface QuestioningScreenProps {
  onReady: () => void;
}

export default function QuestioningScreen({ onReady }: QuestioningScreenProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 pb-safe-lg overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" />

      {/* 별 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div
        className={`
          relative z-10 flex flex-col items-center text-center transition-all duration-1000
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* 아이콘 */}
        <div className="w-20 h-20 rounded-full bg-mainCoral/20 flex items-center justify-center mb-8">
          <svg
            className="w-10 h-10 text-mainCoral"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        {/* 메인 텍스트 */}
        <h1 className="text-white text-xl font-bold mb-4 leading-relaxed">
          카드를 뽑기 전,
          <br />
          물어보고 싶은 것을 떠올려보세요
        </h1>

        <p className="text-white/60 text-sm mb-12 max-w-[280px] leading-relaxed">
          어떤 질문이든 좋아요.
          <br />
          마음속에 품은 질문이 카드를 이끌어요.
        </p>

        {/* 준비 버튼 */}
        <button
          onClick={onReady}
          className="px-12 py-4 bg-gradient-to-r from-mainCoral to-subCoral text-white font-semibold rounded-full shadow-lg shadow-mainCoral/30 hover:shadow-mainCoral/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          준비되었어요
        </button>
      </div>
    </div>
  );
}
