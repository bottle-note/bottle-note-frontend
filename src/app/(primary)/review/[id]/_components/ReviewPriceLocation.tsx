import React from 'react';
import Image from 'next/image';
import { numberWithCommas } from '@/utils/formatNum';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';

interface ReviewPriceLocationProps {
  data: ReviewDetailsWithoutAlcoholInfo;
}

export default function ReviewPriceLocation({
  data,
}: ReviewPriceLocationProps) {
  const hasValidPrice = data.reviewInfo?.price || data.reviewInfo?.price === 0;
  const hasValidSizeType = data.reviewInfo?.sizeType;
  const hasValidLocation = data.reviewInfo?.locationInfo?.address;
  const shouldShowPriceOrLocation =
    hasValidLocation || (hasValidPrice && hasValidSizeType);

  if (!shouldShowPriceOrLocation) return null;

  return (
    <section className="mx-5 py-5 space-y-2 border-b border-mainGray/30 text-13.5">
      {hasValidPrice && hasValidSizeType && (
        <div className="flex items-center space-x-[6px]">
          <Image
            src={
              data.reviewInfo.sizeType === 'BOTTLE'
                ? '/bottle.svg'
                : '/icon/glass-filled-subcoral.svg'
            }
            width={18.4}
            height={18.4}
            alt={
              data.reviewInfo.sizeType === 'BOTTLE'
                ? 'Bottle Price'
                : 'Glass Price'
            }
          />
          <p className="text-mainDarkGray font-bold">
            {data.reviewInfo.sizeType === 'BOTTLE' ? '병 가격 ' : '잔 가격'}
          </p>
          <p className="text-mainDarkGray font-normal">
            {numberWithCommas(data.reviewInfo.price)}₩
          </p>
        </div>
      )}
      {hasValidLocation && (
        <div className="flex items-start space-x-[6px]">
          <Image
            src="/icon/placepoint-subcoral.svg"
            width={18.4}
            height={18.4}
            alt="address"
          />
          <p className="text-mainDarkGray font-bold">장소</p>
          <p className="text-mainDarkGray">
            <>
              <p>{data.reviewInfo?.locationInfo?.name}</p>
              {data.reviewInfo?.locationInfo?.address}{' '}
              {data.reviewInfo?.locationInfo?.detailAddress}{' '}
              <a
                href={data.reviewInfo?.locationInfo?.mapUrl || '#'}
                onClick={(e) => {
                  e.preventDefault();
                  const mapUrl = data.reviewInfo?.locationInfo?.mapUrl;
                  if (mapUrl) {
                    window.open(mapUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="text-subCoral cursor-pointer"
              >
                지도보기
              </a>
            </>
          </p>
        </div>
      )}
    </section>
  );
}
