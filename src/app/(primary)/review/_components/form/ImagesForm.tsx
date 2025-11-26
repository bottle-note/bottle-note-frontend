'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ImageUploader from '@/components/ui/Form/ImageUploader';
import OptionsContainer from '../OptionsContainer';

export default function ImagesForm() {
  const [forceOpen, setForceOpen] = useState(false);
  const [imageCount, setImageCount] = useState<{
    current: number;
    max: number;
  }>({ current: 0, max: 0 });

  useEffect(() => {
    if (forceOpen) {
      const timer = setTimeout(() => {
        setForceOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleImageCountChange = useCallback((count: number, max: number) => {
    setImageCount({ current: count, max });
  }, []);

  const ImageCounter = imageCount.current > 0 && (
    <span className="text-subCoral text-12 font-medium">
      {imageCount.current} / {imageCount.max}
    </span>
  );

  return (
    <OptionsContainer
      iconSrc="/icon/photo-subcoral.svg"
      iconAlt="photoIcon"
      title="사진"
      subTitle="(선택·최대 5장)"
      forceOpen={forceOpen}
      titleSideArea={{
        component: ImageCounter,
      }}
    >
      <ImageUploader
        onForceOpen={setForceOpen}
        onImageCountChange={handleImageCountChange}
      />
    </OptionsContainer>
  );
}
