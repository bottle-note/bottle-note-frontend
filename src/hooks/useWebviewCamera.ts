import { useEffect, useLayoutEffect, useState } from 'react';
import { base64ToFile } from '@/utils/base64ToFile';

interface Params {
  handleImg: (img: File) => void;
}

export const useWebviewCamera = ({ handleImg }: Params) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const [imgBase64, setImgBase64] = useState('');

  useEffect(() => {
    if (imgBase64) {
      const converted = base64ToFile(imgBase64);
      handleImg(converted);
    }
  }, [imgBase64]);

  useLayoutEffect(() => {
    window.openAlbum = (data: string) => {
      setImgBase64(data);
    };
  }, []);

  return { isMobile };
};
