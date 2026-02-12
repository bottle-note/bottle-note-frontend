'use client';

import { useRef, useCallback, useState } from 'react';
import html2canvas from 'html2canvas';

export const useTastingNoteCapture = () => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureAndDownload = useCallback(
    async (filename: string = 'tasting-note') => {
      if (!captureRef.current || isCapturing) return;

      setIsCapturing(true);

      try {
        const canvas = await html2canvas(captureRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Failed to capture tasting note:', error);
      } finally {
        setIsCapturing(false);
      }
    },
    [isCapturing],
  );

  return {
    captureRef,
    isCapturing,
    captureAndDownload,
  };
};
