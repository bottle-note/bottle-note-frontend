'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { AlcoholDetailsResponse } from '@/api/alcohol/types';

import TarotShareDropdown from './TarotShareDropdown';
import { WhiskyRecommend } from '../_types';

interface FinalResultProps {
  whisky: WhiskyRecommend;
  matchReason: string;
  selectedCards: string[];
  prefetchedWhiskyDetail?: AlcoholDetailsResponse['alcohols'] | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  Fresh: '상큼하고 가벼운',
  Sweet: '달콤하고 부드러운',
  Peat: '스모키하고 깊은',
  Strong: '강렬하고 단단한',
  Balance: '조화로운',
};

export default function FinalResult({
  whisky,
  matchReason,
  selectedCards,
  prefetchedWhiskyDetail,
}: FinalResultProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [whiskyDetail, setWhiskyDetail] = useState<
    AlcoholDetailsResponse['alcohols'] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 프리페치된 데이터가 있으면 사용
    if (prefetchedWhiskyDetail) {
      setWhiskyDetail(prefetchedWhiskyDetail);
      setIsLoading(false);
      return;
    }

    const fetchWhiskyDetail = async () => {
      try {
        const result = await AlcoholsApi.getAlcoholDetails(
          String(whisky.whiskyId),
        );
        if (result?.data?.alcohols) {
          setWhiskyDetail(result.data.alcohols);
        }
      } catch (error) {
        console.error('위스키 상세 정보 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (whisky.whiskyId) {
      fetchWhiskyDetail();
    }
  }, [whisky.whiskyId, prefetchedWhiskyDetail]);

  const handleGoToWhisky = () => {
    router.push(`/search/${whisky.whiskyCategory}/${whisky.whiskyId}`);
  };

  const handleShare = () => {
    setIsShareSheetOpen(true);
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-[#2a1515] to-[#0a0a0f]" />

      {/* 메인 콘텐츠 - 스크롤 가능 영역 */}
      <div
        className={`
          relative z-10 flex-1 overflow-y-auto px-6 pt-8 pb-safe-lg
          transition-all duration-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* 상단 타이틀 */}
        <div className="text-center mb-6">
          <span className="text-mainCoral text-sm tracking-wider">
            YOUR WHISKEY
          </span>
          <h1 className="text-white text-2xl font-bold mt-2">
            당신의 위스키가 도착했습니다
          </h1>
        </div>

        {/* 위스키 카드 */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-white/10 to-white/5 rounded-2xl p-4 border border-white/10">
            {/* 위스키 이미지 영역 */}
            <div className="w-full flex items-center justify-center overflow-hidden py-6">
              {isLoading ? (
                <div className="w-12 h-12 border-2 border-mainCoral/30 border-t-mainCoral rounded-full animate-spin" />
              ) : whiskyDetail?.alcoholUrlImg ? (
                <Image
                  src={whiskyDetail.alcoholUrlImg}
                  alt={whiskyDetail.korName || whisky.nameKo}
                  width={200}
                  height={200}
                  className="object-contain max-h-full rounded-md"
                />
              ) : (
                <div className="text-white/40 text-sm">이미지 없음</div>
              )}
            </div>

            {/* 위스키 정보 */}
            <div className="text-center">
              <p className="text-mainCoral text-sm mb-1">
                {CATEGORY_LABELS[whisky.category] || whisky.category}
              </p>
              <h2 className="text-white text-xl font-bold mb-1">
                {whiskyDetail?.korName || whisky.nameKo}
              </h2>
              <p className="text-white/60 text-sm mb-4">
                {whiskyDetail?.engName || whisky.name}
              </p>

              {/* 매칭 이유 + 위스키 설명 */}
              <div className="bg-white/5 rounded-lg p-4">
                <div>
                  {selectedCards.map((cardName, index) => (
                    <span
                      key={index}
                      className="inline-block bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full mr-2 mb-2"
                    >
                      {cardName}
                    </span>
                  ))}
                </div>
                <p className="text-white/80 leading-relaxed whitespace-pre-line pt-1">
                  {matchReason}
                </p>
                <p className="text-white/60 text-sm leading-relaxed mt-3">
                  {whisky.description}
                </p>
              </div>

              {/* CTA 버튼 */}
              <button
                onClick={handleGoToWhisky}
                className="group mt-4 w-full py-3 bg-mainCoral/20 rounded-full flex items-center justify-center gap-2 hover:bg-mainCoral/30 active:scale-[0.98] transition-all"
              >
                <span className="text-mainCoral text-sm font-medium">
                  위스키 마시고 리뷰 남기러 가기
                </span>
                <svg
                  className="w-4 h-4 text-mainCoral group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* 공유 버튼 */}
              <button
                onClick={handleShare}
                className="mt-3 w-full py-3 bg-white/10 rounded-full flex items-center justify-center gap-2 hover:bg-white/15 active:scale-[0.98] transition-all"
              >
                <svg
                  className="w-4 h-4 text-white/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="text-white/80 text-sm">친구에게 추천하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 공유 바텀시트 - 1단계: 진입점 공유만 */}
      <TarotShareDropdown
        isOpen={isShareSheetOpen}
        onClose={() => setIsShareSheetOpen(false)}
      />
    </div>
  );
}
