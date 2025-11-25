'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import { SaveImages } from '@/types/Image';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import { useWebviewCamera } from '@/hooks/useWebviewCamera';
import OptionDropdown from '@/components/ui/Modal/OptionDropdown';
import useModalStore from '@/store/modalStore';

interface ImageUploaderProps {
  onForceOpen?: (value: boolean) => void;
  onExtraButtonsChange?: (extraButtons: React.ReactNode) => void;
  useMarginLeft?: boolean;
}

export default function ImageUploader({
  onForceOpen,
  onExtraButtonsChange,
  useMarginLeft = true,
}: ImageUploaderProps) {
  const imageRef = useRef<HTMLInputElement>(null);
  const imageRefModify = useRef<HTMLInputElement>(null);
  const { setValue, watch } = useFormContext();
  const { isMobile } = useWebViewInit();
  const { handleModalState, handleCloseModal } = useModalStore();
  const [previewImages, setPreviewImages] = useState<SaveImages[]>([]);
  const [savedImages, setSavedImages] = useState<SaveImages[]>([]);
  const [isOptionShow, setIsOptionShow] = useState(false);

  const onUploadPreview = (imgData: File) => {
    const newFiles = [imgData];

    if (newFiles && newFiles.length > 0) {
      // 이미지 미리보기용
      const previewImgCount = previewImages.length ?? 0;
      const maxOrderId =
        previewImages.length > 0
          ? Math.max(...previewImages.map((img) => img.order))
          : 0;
      const imgForPreview = Array.from(newFiles)
        .slice(0, 5 - previewImgCount)
        .map((file, index) => ({
          order: maxOrderId + index + 1,
          image: URL.createObjectURL(file),
        }));
      setPreviewImages([...previewImages, ...imgForPreview]);

      // S3 업로드용
      const addedNewImages = watch('images') ?? [];
      const imgForS3 = Array.from(newFiles)
        .slice(0, 5 - previewImgCount)
        .map((file, index) => ({
          order: maxOrderId + index + 1,
          image: file,
        }));
      setValue('images', [...addedNewImages, ...imgForS3]);
    }
  };

  const onUploadMultiplePreview = (imgDataList: File[]) => {
    if (imgDataList && imgDataList.length > 0) {
      // 이미지 미리보기용
      const previewImgCount = previewImages.length ?? 0;
      const maxOrderId =
        previewImages.length > 0
          ? Math.max(...previewImages.map((img) => img.order))
          : 0;
      const imgForPreview = Array.from(imgDataList)
        .slice(0, 5 - previewImgCount)
        .map((file, index) => ({
          order: maxOrderId + index + 1,
          image: URL.createObjectURL(file),
        }));
      setPreviewImages([...previewImages, ...imgForPreview]);

      // S3 업로드용
      const addedNewImages = watch('images') ?? [];
      const imgForS3 = Array.from(imgDataList)
        .slice(0, 5 - previewImgCount)
        .map((file, index) => ({
          order: maxOrderId + index + 1,
          image: file,
        }));
      setValue('images', [...addedNewImages, ...imgForS3]);
    }
  };

  const removeImage = (image: string, order: number) => {
    let updatedPreviews;
    let updatedFiles;

    const existingImages: string[] = savedImages.map((file) => file.image);

    // 기존 이미지 삭제
    if (existingImages.includes(image)) {
      updatedPreviews = previewImages.filter((file) => file.image !== image);
      const DBImages = savedImages
        .filter((file) => file.order !== order)
        .map((file) => ({
          order: file.order,
          viewUrl: file.image,
        }));
      setValue('imageUrlList', DBImages);
      setSavedImages(savedImages.filter((file) => file.order !== order));
    } else {
      // 새로 업로드된 이미지 삭제
      const images = watch('images');
      updatedFiles = images?.filter((file: SaveImages) => file.order !== order);
      updatedPreviews = previewImages.filter(
        (file: SaveImages) => file.order !== order,
      );
    }

    setValue('images', updatedFiles);
    setPreviewImages(updatedPreviews);
  };

  const { handleOpenCamera, handleOpenAlbumMultiple } = useWebviewCamera({
    handleImg: onUploadPreview,
    handleMultipleImgs: onUploadMultiplePreview,
  });

  const SELECT_OPTIONS = [
    { type: 'camera', name: '카메라' },
    { type: 'album', name: '앨범에서 선택' },
  ];

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
    // 5장 제한 체크
    if (previewImages.length >= 5) {
      handleModalState({
        isShowModal: true,
        mainText: '이미지는 최대 5장까지 등록할 수 있습니다.',
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

  useEffect(() => {
    if (watch('imageUrlList')) {
      const urlData = watch('imageUrlList').map(
        (data: { order: number; viewUrl: string }) => {
          return {
            order: data.order,
            image: data.viewUrl,
          };
        },
      );
      setSavedImages(urlData);
      setPreviewImages(urlData);
    }
  }, []);

  const ExtraButtons = (
    <div className="flex items-center">
      <button
        onClick={() => {
          imageRefModify.current?.click();
        }}
        className="text-subCoral text-12"
      >
        이미지 수정
        <input
          type="file"
          accept="image/*"
          hidden
          ref={imageRefModify}
          onChange={(event) => {
            const fileInput = event.target;
            const files = fileInput.files;

            if (files && files.length > 0) {
              const filesArray = Array.from(files);
              onUploadMultiplePreview(filesArray);
              fileInput.value = '';
            }
            onForceOpen?.(true);
          }}
          multiple
        />
      </button>
    </div>
  );

  useEffect(() => {
    if (onExtraButtonsChange) {
      const shouldShowExtraButtons =
        previewImages?.length !== 0 && previewImages?.length !== 5;
      onExtraButtonsChange(shouldShowExtraButtons ? ExtraButtons : null);
    }
  }, [previewImages, onExtraButtonsChange]);

  return (
    <>
      <div
        className={`flex justify-start items-center h-[3.8rem] space-x-2 ${useMarginLeft ? 'ml-7' : ''}`}
      >
        {previewImages?.map((data: SaveImages) => (
          <figure key={data?.order} className="relative h-full">
            <Image
              src={data?.image}
              alt="이미지"
              height={60}
              width={60}
              quality={75}
              className="h-full"
            />
            <button
              onClick={() => removeImage(data?.image, data?.order)}
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
            onChange={(event) => {
              const fileInput = event.target;
              const files = fileInput.files;

              if (files && files.length > 0) {
                const filesArray = Array.from(files);
                onUploadMultiplePreview(filesArray);
                fileInput.value = '';
              }
              onForceOpen?.(true);
            }}
            multiple
          />
        </button>
      </div>

      {isOptionShow && (
        <OptionDropdown
          title="이미지 추가"
          options={SELECT_OPTIONS}
          handleOptionSelect={handleOptionSelect}
          handleClose={() => setIsOptionShow(false)}
        />
      )}
    </>
  );
}
