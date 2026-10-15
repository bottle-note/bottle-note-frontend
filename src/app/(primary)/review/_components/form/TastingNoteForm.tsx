'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Button from '@/components/ui/Button/Button';
import {
  isDefaultTastingProfile,
  isTastingProfileEmpty,
} from '@/api/review/tastingProfile';
import { TASTING_MAX_VALUE } from '@/constants/tastingNote';
import { FormValues } from '@/types/Review';
import TastingRadarChart from './TastingRadarChart';
import TastingNoteModal from './TastingNoteModal';
import OptionsContainer from '../OptionsContainer';

export default function TastingNoteForm() {
  const { watch } = useFormContext<FormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tastingProfile = watch('tastingProfile');
  const hasNote = tastingProfile && !isTastingProfileEmpty(tastingProfile);
  const isCustom = hasNote && !isDefaultTastingProfile(tastingProfile);

  return (
    <>
      <OptionsContainer
        iconSrc="/icon/success-subcoral.svg"
        iconAlt="tastingNoteIcon"
        forceOpen
        title="테이스팅 노트"
        subTitle="(선택)"
      >
        <div className="ml-28 mt-4">
          {hasNote ? (
            // 작성 완료: 미리보기 차트 + 수정 버튼
            <div className="flex flex-col items-center gap-12">
              {tastingProfile.axes.length >= 3 ? (
                <div className="w-180 h-180">
                  <TastingRadarChart
                    axes={tastingProfile.axes}
                    maxScore={tastingProfile.maxScore}
                    size={180}
                  />
                </div>
              ) : (
                <p className="text-13 text-fg-neutral">
                  {tastingProfile.axes
                    .map(
                      (axis) =>
                        `${axis.name} ${axis.score}/${tastingProfile.maxScore}`,
                    )
                    .join(' · ')}
                </p>
              )}
              {isCustom && (
                <span className="rounded-sm bg-bg-brand-weak px-8 text-12 font-bold text-fg-brand">
                  커스텀 · {tastingProfile.axes.length}개 항목
                  {tastingProfile.maxScore !== TASTING_MAX_VALUE &&
                    ` · ${tastingProfile.maxScore}점`}
                </span>
              )}
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                size="sm"
                variant="text"
              >
                수정하기
              </Button>
            </div>
          ) : (
            // 미작성: CTA 버튼
            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              size="md"
              variant="secondary"
              fullWidth
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
            </Button>
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
