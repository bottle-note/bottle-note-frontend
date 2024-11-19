'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import { SaveImages } from '@/types/Image';

export default function ImagesForm() {
  const imageRef = useRef<HTMLInputElement>(null);
  const { setValue, watch } = useFormContext();
  const [previewImages, setPreviewImages] = useState<SaveImages[]>([]);
  const [savedImages, setSavedImages] = useState<SaveImages[]>([]);

  const onUploadPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;

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
      updatedPreviews = previewImages.filter((file) => file.order !== order);
      const DBImages = savedImages
        .filter((file) => file.order !== order)
        .map((file) => ({
          order: file.order,
          viewUrl: file.image,
        }));
      setValue('imageUrlList', DBImages);
      DBImages &&
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

  return (
    <section className="space-y-1">
      <article className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Image
            src="/icon/photo-subcoral.svg"
            alt="placeIcon"
            width={24}
            height={24}
          />
          <p className="text-12 text-mainDarkGray font-bold">
            이미지 추가{' '}
            <span className="text-mainGray font-normal">(선택·최대 5장)</span>
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-mainGray font-normal text-10">
            {previewImages?.length === 0 ? '' : '이미지 수정'}
          </p>
          <Image
            src="/icon/arrow-right-subcoral.svg"
            alt="rightIcon"
            width={18}
            height={18}
            onClick={() => imageRef.current?.click()}
          />
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imageRef}
            onChange={onUploadPreview}
            multiple
          />
        </div>
      </article>
      {previewImages?.length !== 0 && (
        <div className="flex justify-start items-center h-[3.8rem] space-x-2">
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
        </div>
      )}
    </section>
  );
}
