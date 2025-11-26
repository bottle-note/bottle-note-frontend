import { useState, useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SaveImages } from '@/types/Image';

export const useImageUploader = () => {
  const { setValue, getValues, control } = useFormContext();
  const [previewImages, setPreviewImages] = useState<SaveImages[]>([]);
  const [savedImages, setSavedImages] = useState<SaveImages[]>([]);

  const isInitializedRef = useRef(false);
  const blobUrlToFileMapRef = useRef<Map<string, File>>(new Map());

  const MAX_IMAGES = 5;

  // form에서 데이터가 로드될 때까지 기다림
  const imageUrlList = useWatch({ name: 'imageUrlList', control });

  const getNextOrder = (images: SaveImages[]): number => {
    return images.length > 0
      ? Math.max(...images.map((img) => img.order)) + 1
      : 1;
  };

  const reorderImages = (images: SaveImages[]): SaveImages[] => {
    return images.map((img, index) => ({
      ...img,
      order: index + 1,
    }));
  };

  const validateLimit = (): boolean => {
    return previewImages.length < MAX_IMAGES;
  };

  // 사진 수정: 초기 이미지 로드
  useEffect(() => {
    if (isInitializedRef.current || !imageUrlList?.length) return;

    const urlData = imageUrlList.map(
      (data: { order: number; viewUrl: string }) => ({
        order: data.order,
        image: data.viewUrl,
      }),
    );
    setSavedImages(urlData);
    setPreviewImages(urlData);
    isInitializedRef.current = true;
  }, [imageUrlList]);

  const _uploadImages = (files: File[]) => {
    if (files && files.length > 0) {
      setPreviewImages((currentPreviews) => {
        const maxOrderId = getNextOrder(currentPreviews) - 1;
        const availableSlots = MAX_IMAGES - currentPreviews.length;

        // 이미지 미리보기용
        const imgForPreview = Array.from(files)
          .slice(0, availableSlots)
          .map((file, index) => {
            const blobUrl = URL.createObjectURL(file);
            // Blob URL과 File 매핑 저장
            blobUrlToFileMapRef.current.set(blobUrl, file);
            return {
              order: maxOrderId + index + 1,
              image: blobUrl,
            };
          });

        // S3 업로드용
        const addedNewImages = getValues('images') ?? [];
        const imgForS3 = Array.from(files)
          .slice(0, availableSlots)
          .map((file, index) => ({
            order: maxOrderId + index + 1,
            image: file,
          }));
        setValue('images', [...addedNewImages, ...imgForS3]);

        return [...currentPreviews, ...imgForPreview];
      });
    }
  };

  const uploadSingleImage = (imgData: File) => {
    _uploadImages([imgData]);
  };

  const uploadMultipleImages = (imgDataList: File[]) => {
    _uploadImages(imgDataList);
  };

  const removeImage = (image: string) => {
    const isSavedImage = savedImages.some((file) => file.image === image);

    // 미리보기에서 제거 및 재정렬
    setPreviewImages((currentPreviews) => {
      const filtered = currentPreviews.filter((file) => file.image !== image);
      const reordered = reorderImages(filtered);

      const updatedSaved: SaveImages[] = [];
      const updatedNew: { order: number; image: File }[] = [];

      reordered.forEach((preview) => {
        const isSaved = savedImages.some((s) => s.image === preview.image);

        if (isSaved) {
          updatedSaved.push(preview);
        } else {
          const file = blobUrlToFileMapRef.current.get(preview.image);
          if (file) {
            updatedNew.push({
              order: preview.order,
              image: file,
            });
          }
        }
      });

      setSavedImages(updatedSaved);
      setValue(
        'imageUrlList',
        updatedSaved.map((img) => ({
          order: img.order,
          viewUrl: img.image,
        })),
      );

      setValue('images', updatedNew);

      if (!isSavedImage) {
        blobUrlToFileMapRef.current.delete(image);
        URL.revokeObjectURL(image);
      }

      return reordered;
    });
  };

  return {
    previewImages,
    uploadSingleImage,
    uploadMultipleImages,
    removeImage,
    validateLimit,
    MAX_IMAGES,
  };
};
