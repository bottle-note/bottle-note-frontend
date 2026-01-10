'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TarotPromoCardProps {
  onClose: () => void;
}

export function TarotPromoCard({ onClose }: TarotPromoCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={`
        mx-4 mt-0 mb-[15px] overflow-hidden transition-all duration-500 ease-out
        ${isVisible ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}
      `}
    >
      <Link
        href="/whiskey-tarot"
        className="block p-4 bg-mainCoral/10 rounded-xl relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="닫기"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="pr-8">
          <h3 className="text-mainCoral font-semibold text-base">
            위스키와 함께하는 타로점
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            타로 카드를 뽑아 추천 위스키를 점쳐보세요.
          </p>
        </div>
      </Link>
    </div>
  );
}
