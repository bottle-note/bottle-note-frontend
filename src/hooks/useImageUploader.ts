import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SaveImages } from '@/types/Image';

interface NewImage {
  order: number;
  image: File;
}
interface SavedImage {
  order: number;
  viewUrl: string;
}
interface LocalPreview extends NewImage {
  url: string;
}

const MAX_IMAGES = 5;

export const useImageUploader = () => {
  const { setValue, getValues, control } = useFormContext();
  const images: NewImage[] | null | undefined = useWatch({
    name: 'images',
    control,
  });
  const saved: SavedImage[] | null | undefined = useWatch({
    name: 'imageUrlList',
    control,
  });
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([]);

  // File objects belong to the form. This effect owns only disposable preview URLs.
  // Keeping writes out of React state updaters prevents duplicate uploads in StrictMode.
  useEffect(() => {
    const previews = (images ?? []).map((image) => ({
      ...image,
      url: URL.createObjectURL(image.image),
    }));
    setLocalPreviews(previews);
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [images]);

  const previewImages: SaveImages[] = [
    ...(saved ?? []).map(({ order, viewUrl }) => ({ order, image: viewUrl })),
    ...localPreviews.map(({ order, url }) => ({ order, image: url })),
  ].sort((left, right) => left.order - right.order);

  const uploadMultipleImages = (files: File[]) => {
    const current: NewImage[] = getValues('images') ?? [];
    const stored: SavedImage[] = getValues('imageUrlList') ?? [];
    const available = Math.max(0, MAX_IMAGES - current.length - stored.length);
    const additions = files.slice(0, available);
    if (!additions.length) return;
    const lastOrder = Math.max(
      0,
      ...current.map(({ order }) => order),
      ...stored.map(({ order }) => order),
    );
    setValue(
      'images',
      [
        ...current,
        ...additions.map((image, index) => ({
          order: lastOrder + index + 1,
          image,
        })),
      ],
      { shouldDirty: true },
    );
  };

  const removeImage = (url: string) => {
    const remaining = previewImages.filter((preview) => preview.image !== url);
    const updatedSaved: SavedImage[] = [];
    const updatedNew: NewImage[] = [];
    remaining.forEach((preview, index) => {
      const local = localPreviews.find((item) => item.url === preview.image);
      if (local) updatedNew.push({ order: index + 1, image: local.image });
      else updatedSaved.push({ order: index + 1, viewUrl: preview.image });
    });
    setValue('imageUrlList', updatedSaved, { shouldDirty: true });
    setValue('images', updatedNew, { shouldDirty: true });
  };

  return {
    previewImages,
    uploadSingleImage: (image: File) => uploadMultipleImages([image]),
    uploadMultipleImages,
    removeImage,
    validateLimit: () =>
      (getValues('images')?.length ?? 0) +
        (getValues('imageUrlList')?.length ?? 0) <
      MAX_IMAGES,
    MAX_IMAGES,
  };
};
