'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  isTastingNoteEmpty,
  DEFAULT_TASTING_NOTE,
} from '@/constants/tastingNote';
import { FormValues } from '@/types/Review';
import TastingRadarChart from './TastingRadarChart';
import TastingNoteModal from './TastingNoteModal';
import OptionsContainer from '../OptionsContainer';

export default function TastingNoteForm() {
  const { watch } = useFormContext<FormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tastingNote = watch('tastingNote');
  const hasNote = !isTastingNoteEmpty(tastingNote ?? null);

  return (
    <>
      <OptionsContainer
        iconSrc="/icon/success-subcoral.svg"
        iconAlt="tastingNoteIcon"
        forceOpen
        title="테이스팅 노트"
        subTitle="(선택)"
      >
        <div className="ml-7 mt-1">
          {hasNote ? (
            // 작성 완료: 미리보기 차트 + 수정 버튼
            <div className="flex flex-col items-center gap-3">
              <div className="w-[180px] h-[180px]">
                <TastingRadarChart
                  values={tastingNote ?? DEFAULT_TASTING_NOTE}
                  size={180}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-13 text-subCoral underline underline-offset-2"
              >
                수정하기
              </button>
            </div>
          ) : (
            // 미작성: CTA 버튼
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 border border-dashed border-subCoral/50 rounded-lg
                flex items-center justify-center gap-2
                text-14 text-subCoral
                active:bg-subCoral/5 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              그래프로 풍미 기록하기
            </button>
          )}
        </div>
      </OptionsContainer>

      <TastingNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
