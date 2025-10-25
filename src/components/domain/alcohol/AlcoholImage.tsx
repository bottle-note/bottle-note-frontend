'use client';

import React, { memo, useState } from 'react';
import BaseImage from '@/components/ui/Display/BaseImage';
import ImageModal from '@/components/ui/Modal/ImageModal';

interface Props {
  imageUrl: string;
  outerHeightClass?: string;
  outerWidthClass?: string;
  innerHeightClass?: string;
  innerWidthClass?: string;
  bgColor?: string;
  blendMode?: string;
  rounded?: string;
  priority?: boolean;
  enableModal?: boolean;
}

const AlcoholImage = ({
  imageUrl,
  outerHeightClass = 'h-[171px]', // default height for the image of review
  outerWidthClass = 'w-[99px]',
  innerWidthClass = 'w-[70px]',
  innerHeightClass = 'h-[141px]',
  bgColor = 'bg-white',
  blendMode = '',
  rounded = 'rounded-lg',
  priority = true,
  enableModal = false,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const innerWidth = parseInt(innerWidthClass.match(/\d+/)?.[0] || '0', 10);

  const handleImageClick = () => {
    if (enableModal) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`${rounded} ${bgColor} flex items-center justify-center ${outerHeightClass} ${outerWidthClass} shrink-0 ${enableModal ? 'cursor-pointer' : ''}`}
        onClick={handleImageClick}
        tabIndex={enableModal ? 0 : -1}
        role={enableModal ? 'button' : undefined}
        onKeyDown={(e) => {
          if (enableModal && (e.key === 'Enter' || e.key === ' ')) {
            handleImageClick();
            return;
          }
        }}
      >
        <div
          className={`relative ${innerHeightClass} ${innerWidthClass} flex items-center justify-center`}
        >
          <BaseImage
            src={imageUrl}
            alt="alcohol image"
            priority={priority}
            className={`object-contain ${blendMode}`}
            rounded={rounded}
            sizes={`${innerWidth}px`}
            fill
          />
        </div>
      </div>

      {enableModal && (
        <ImageModal
          imageUrl={imageUrl}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default memo(AlcoholImage);
