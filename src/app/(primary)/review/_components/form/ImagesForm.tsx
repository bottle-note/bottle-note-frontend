'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import ImageUploader from '@/components/ui/Form/ImageUploader';
import OptionsContainer from '../OptionsContainer';

export default function ImagesForm() {
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      const timer = setTimeout(() => {
        setForceOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);
  const [extraButtons, setExtraButtons] = useState<ReactNode>(null);

  return (
    <OptionsContainer
      iconSrc="/icon/photo-subcoral.svg"
      iconAlt="photoIcon"
      title="사진"
      subTitle="(선택·최대 5장)"
      forceOpen={forceOpen}
      titleSideArea={{
        component: extraButtons,
      }}
    >
      <ImageUploader
        onForceOpen={setForceOpen}
        onExtraButtonsChange={setExtraButtons}
      />
    </OptionsContainer>
  );
}
