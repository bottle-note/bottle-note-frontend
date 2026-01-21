'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import { useWebviewCamera } from '@/hooks/useWebviewCamera';
import { useImageUploader } from '@/hooks/useImageUploader';
import OptionDropdown from '@/components/ui/Modal/OptionDropdown';
import useModalStore from '@/store/modalStore';

const getSelectOptions = () => {
  return [
    { type: 'camera', name: '카메라' },
    { type: 'album', name: '앨범에서 선택' },
  ];
};

interface ImageUploaderProps {
  onForceOpen?: (value: boolean) => void;
  onImageCountChange?: (count: number, maxCount: number) => void;
  useMarginLeft?: boolean;
}

export default function ImageUploader({
  onForceOpen,
  onImageCountChange,
  useMarginLeft = true,
}: ImageUploaderProps) {
  const imageRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useWebViewInit();
  const { handleModalState, handleCloseModal } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);

  const {
    previewImages,
    uploadSingleImage,
    uploadMultipleImages,
    removeImage,
    validateLimit,
    MAX_IMAGES,
  } = useImageUploader();

  const { handleOpenCamera, handleOpenAlbumMultiple } = useWebviewCamera({
    handleImg: uploadSingleImage,
    handleMultipleImgs: uploadMultipleImages,
  });

  const handleOptionSelect = ({ type }: { type: string }) => {
    if (type === 'camera') {
      return handleOpenCamera();
    }

    if (type === 'album') {
      if (isMobile) return handleOpenAlbumMultiple();
      return imageRef.current?.click();
    }

    setIsOptionShow(false);
  };

  const onClickAddImage = () => {
    if (!validateLimit()) {
      handleModalState({
        isShowModal: true,
        mainText: `이미지는 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다.`,
        handleConfirm: handleCloseModal,
      });
      return;
    }

    // 모바일에서는 카메라/앨범 선택 옵션 표시
    if (isMobile) {
      setIsOptionShow(true);
      return;
    }

    // 웹에서는 기존처럼 파일 선택
    return imageRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const files = fileInput.files;

    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      uploadMultipleImages(filesArray);
      fileInput.value = '';
    }
    onForceOpen?.(true);
  };

  useEffect(() => {
    if (onImageCountChange) {
      onImageCountChange(previewImages.length, MAX_IMAGES);
    }
  }, [previewImages.length, MAX_IMAGES, onImageCountChange]);

  return (
    <>
      <div
        className={`flex justify-start items-center h-[3.8rem] space-x-2 ${useMarginLeft ? 'ml-7' : ''}`}
      >
        {previewImages?.map((data) => (
          <figure key={data?.image} className="relative h-full">
            <Image
              src={data?.image}
              alt="이미지"
              height={60}
              width={60}
              quality={75}
              className="h-full"
            />
            <button
              onClick={() => removeImage(data?.image)}
              className="absolute top-0 right-0 bg-black"
            >
              <Image
                src="/icon/close-white.svg"
                width={18}
                height={18}
                alt="close"
              />
            </button>
          </figure>
        ))}

        <button
          onClick={onClickAddImage}
          className="h-[3.8rem] w-[3.8rem] border border-subCoral flex flex-col justify-center items-center"
        >
          <Image
            src="/icon/plus-subcoral.svg"
            width={20}
            height={20}
            alt="plus"
          />
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imageRef}
            onChange={handleFileChange}
            multiple
          />
        </button>
      </div>

      {isOptionShow && (
        <OptionDropdown
          title="이미지 추가"
          options={getSelectOptions()}
          handleOptionSelect={handleOptionSelect}
          handleClose={() => setIsOptionShow(false)}
        />
      )}
    </>
  );
}
