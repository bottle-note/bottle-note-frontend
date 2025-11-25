import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { SaveImages } from '@/types/Image';

export const useImageUploader = () => {
  const { setValue, watch } = useFormContext();
  const [previewImages, setPreviewImages] = useState<SaveImages[]>([]);
  const [savedImages, setSavedImages] = useState<SaveImages[]>([]);

  const MAX_IMAGES = 5;

  // 다음 Order 계산
  const getNextOrder = (images: SaveImages[]): number => {
    return images.length > 0
      ? Math.max(...images.map((img) => img.order)) + 1
      : 1;
  };

  // 남은 슬롯 계산
  const getAvailableSlots = (): number => {
    return MAX_IMAGES - previewImages.length;
  };

  // 이미지 업로드 제한 검증
  const validateLimit = (): boolean => {
    return previewImages.length < MAX_IMAGES;
  };

  // 단일 이미지 업로드
  const uploadSingleImage = (imgData: File) => {
    const newFiles = [imgData];

    if (newFiles && newFiles.length > 0) {
      const maxOrderId = getNextOrder(previewImages) - 1;
      const availableSlots = getAvailableSlots();

      // 이미지 미리보기용
      const imgForPreview = Array.from(newFiles)
        .slice(0, availableSlots)
        .map((file, index) => ({
          order: maxOrderId + index + 1,
          image: URL.createObjectURL(file),
        }));
      setPreviewImages([...previewImages, ...imgForPreview]);

      // S3 업로드용
      const addedNewImages = watch('images') ?? [];
      const imgForS3 = Array.from(newFiles)
        .slice(0, availableSlots)
        .map((file, index) => ({
          order: maxOrderId + index + 1,
          image: file,
        }));
      setValue('images', [...addedNewImages, ...imgForS3]);
    }
  };

  // 다중 이미지 업로드
  const uploadMultipleImages = (imgDataList: File[]) => {
    if (imgDataList && imgDataList.length > 0) {
      const maxOrderId = getNextOrder(previewImages) - 1;
      const availableSlots = getAvailableSlots();

      // 이미지 미리보기용
      const imgForPreview = Array.from(imgDataList)
        .slice(0, availableSlots)
        .map((file, index) => ({
          order: maxOrderId + index + 1,
          image: URL.createObjectURL(file),
        }));
      setPreviewImages([...previewImages, ...imgForPreview]);

      // S3 업로드용
      const addedNewImages = watch('images') ?? [];
      const imgForS3 = Array.from(imgDataList)
        .slice(0, availableSlots)
        .map((file, index) => ({
          order: maxOrderId + index + 1,
          image: file,
        }));
      setValue('images', [...addedNewImages, ...imgForS3]);
    }
  };

  // 이미지 제거
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

  // 초기 이미지 로드 (수정 모드)
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

  return {
    previewImages,
    uploadSingleImage,
    uploadMultipleImages,
    removeImage,
    validateLimit,
    MAX_IMAGES,
  };
};
