import { useLayoutEffect } from 'react';
import { base64ToFile } from '@/utils/base64ToFile';
import { handleWebViewMessage } from '@/utils/flutterUtil';

interface Params {
  handleImg: (img: File) => void;
  handleMultipleImgs?: (imgs: File[]) => void;
}

/**
 * 플러터에서 이미지를 전송받은 이후 실행할 콜백 함수(handleImg)를 전달합니다.
 */
export const useWebviewCamera = ({ handleImg, handleMultipleImgs }: Params) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleOpenCamera = (cb?: () => void) => {
    if (isMobile) {
      return handleWebViewMessage('openCamera');
    }

    if (cb) return cb();

    return alert('모바일에서만 이용 가능합니다.');
  };
  const handleOpenAlbum = () => handleWebViewMessage('openAlbum');
  const handleOpenAlbumMultiple = () => handleWebViewMessage('openAlbumMultiple');

  useLayoutEffect(() => {
    window.openAlbum = (data: string) => {
      handleImg(base64ToFile(data));
    };

    window.openAlbumMultiple = (jsonData: string) => {
      if (!handleMultipleImgs) return;

      try {
        const base64Images: string[] = JSON.parse(jsonData);
        const files = base64Images.map((base64) => base64ToFile(base64));
        handleMultipleImgs(files);
      } catch (error) {
        console.error('Failed to parse multiple images:', error);
      }
    };
  }, [handleImg, handleMultipleImgs]);

  return {
    isMobile,
    handleOpenCamera,
    handleOpenAlbum,
    handleOpenAlbumMultiple,
  };
};
