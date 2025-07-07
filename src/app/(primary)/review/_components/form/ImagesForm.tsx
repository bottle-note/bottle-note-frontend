'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import { SaveImages } from '@/types/Image';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import { useWebviewCamera } from '@/hooks/useWebviewCamera';
import OptionsContainer from '../OptionsContainer';

export default function ImagesForm() {
  const imageRef = useRef<HTMLInputElement>(null);
  const imageRefModify = useRef<HTMLInputElement>(null);
  const { setValue, watch } = useFormContext();
  const { isMobile } = useWebViewInit();
  const [previewImages, setPreviewImages] = useState<SaveImages[]>([]);
  const [savedImages, setSavedImages] = useState<SaveImages[]>([]);
  const [forceOpen, setForceOpen] = useState(false);

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

  const { handleOpenAlbum } = useWebviewCamera({
    handleImg: onUploadPreview,
  });

  const onClickAddImage = () => {
    if (isMobile) return handleOpenAlbum();
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

  useEffect(() => {
    forceOpen && setForceOpen(false);
  }, [previewImages, forceOpen]);

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
            const file = fileInput.files?.[0];

            if (file) {
              onUploadPreview(file);
              fileInput.value = '';
            }
            setForceOpen(true);
          }}
          multiple
        />
      </button>
    </div>
  );

  return (
    <OptionsContainer
      iconSrc="/icon/photo-subcoral.svg"
      iconAlt="photoIcon"
      title="사진"
      subTitle="(선택·최대 5장)"
      forceOpen={forceOpen}
      titleSideArea={{
        component:
          previewImages?.length !== 0 &&
          previewImages?.length !== 5 &&
          ExtraButtons,
      }}
    >
      <div className="flex justify-start items-center h-[3.8rem] space-x-2 ml-7">
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

        {previewImages?.length < 5 && (
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
                const file = fileInput.files?.[0];

                if (file) {
                  onUploadPreview(file);
                  fileInput.value = '';
                }
                setForceOpen(true);
              }}
              multiple
            />
          </button>
        )}
      </div>
    </OptionsContainer>
  );
}
