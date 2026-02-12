'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';

import TastingRadarChart from './TastingRadarChart';
import TastingSliderGroup from './TastingSliderGroup';
import TastingNoteCapture from './TastingNoteCapture';
import {
  TastingNoteFormState,
  TastingAxisKey,
  DEFAULT_TASTING_NOTE,
} from '../types';
import { useTastingNoteCapture } from '../_hooks/useTastingNoteCapture';

interface Props {
  alcoholId: string;
  alcoholName: string;
  alcoholImage: string;
}

export default function TastingNoteForm({ alcoholName, alcoholImage }: Props) {
  const [formState, setFormState] =
    useState<TastingNoteFormState>(DEFAULT_TASTING_NOTE);
  const { captureRef, isCapturing, captureAndDownload } =
    useTastingNoteCapture();

  const handleSliderChange = useCallback(
    (key: TastingAxisKey, value: number) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleMemoChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, memo: e.target.value }));
    },
    [],
  );

  const handleSaveImage = () => {
    const safeName = alcoholName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const dateStr = format(new Date(), 'yyyyMMdd');
    captureAndDownload(`tasting-note_${safeName}_${dateStr}`);
  };

  const today = format(new Date(), 'yyyy.MM.dd');

  return (
    <div className="pb-safe">
      {/* 미리보기 차트 */}
      <section className="py-6">
        <TastingRadarChart data={formState} />
      </section>

      {/* 슬라이더 */}
      <section className="mx-5 my-6 p-5 bg-sectionWhite rounded-xl">
        <h3 className="mb-4 text-14 font-bold text-mainDarkGray">풍미 조절</h3>
        <TastingSliderGroup data={formState} onChange={handleSliderChange} />
      </section>

      {/* 메모 */}
      <section className="px-5 py-6 border-t border-mainGray/30">
        <h3 className="mb-4 text-14 font-bold text-mainDarkGray">메모</h3>
        <textarea
          value={formState.memo}
          onChange={handleMemoChange}
          placeholder="이 위스키에 대한 메모를 남겨보세요..."
          className="w-full h-24 p-3 text-14 border border-mainGray/30 rounded-lg resize-none focus:outline-none focus:border-subCoral"
          maxLength={200}
        />
        <p className="mt-1 text-right text-11 text-mainGray">
          {formState.memo.length}/200
        </p>
      </section>

      {/* 캡처용 숨겨진 영역 */}
      <div className="fixed left-[-9999px] top-0">
        <TastingNoteCapture
          ref={captureRef}
          alcoholName={alcoholName}
          alcoholImage={alcoholImage}
          data={formState}
          memo={formState.memo}
          date={today}
        />
      </div>

      {/* 저장 버튼 */}
      <section className="px-5 pt-4 pb-8">
        <button
          onClick={handleSaveImage}
          disabled={isCapturing}
          className="w-full py-4 bg-subCoral text-white text-16 font-bold rounded-xl disabled:opacity-50"
        >
          {isCapturing ? '저장 중...' : '이미지로 저장'}
        </button>
      </section>
    </div>
  );
}
