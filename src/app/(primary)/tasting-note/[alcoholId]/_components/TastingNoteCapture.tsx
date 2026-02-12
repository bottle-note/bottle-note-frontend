'use client';

import { forwardRef } from 'react';
import Image from 'next/image';

import TastingRadarChart from './TastingRadarChart';
import { TastingNoteData, TASTING_AXES } from '../types';

interface Props {
  alcoholName: string;
  alcoholImage: string;
  data: TastingNoteData;
  memo: string;
  date: string;
}

const TastingNoteCapture = forwardRef<HTMLDivElement, Props>(
  ({ alcoholName, alcoholImage, data, memo, date }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white p-5 rounded-xl"
        style={{ width: '360px' }}
      >
        {/* 헤더: 위스키 정보 */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="relative w-12 h-16 rounded-md overflow-hidden bg-gray-100">
            {alcoholImage && (
              <Image
                src={alcoholImage}
                alt={alcoholName}
                fill
                className="object-contain"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-14 font-bold text-mainDarkGray truncate">
              {alcoholName}
            </p>
            <p className="text-11 text-subCoral">{date}</p>
          </div>
        </div>

        {/* 차트 */}
        <div className="mb-4">
          <TastingRadarChart data={data} />
        </div>

        {/* 점수 */}
        <div className="grid grid-cols-5 gap-2 mb-4 px-2">
          {TASTING_AXES.map((axis) => (
            <div key={axis.key} className="text-center">
              <p className="text-10 text-mainGray">{axis.label}</p>
              <p className="text-14 font-bold text-subCoral">
                {data[axis.key]}
              </p>
            </div>
          ))}
        </div>

        {/* 메모 */}
        {memo && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-12 text-mainDarkGray whitespace-pre-wrap">
              {memo}
            </p>
          </div>
        )}

        {/* 워터마크 */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <p className="text-10 text-mainGray">Bottle Note</p>
        </div>
      </div>
    );
  },
);

TastingNoteCapture.displayName = 'TastingNoteCapture';

export default TastingNoteCapture;
