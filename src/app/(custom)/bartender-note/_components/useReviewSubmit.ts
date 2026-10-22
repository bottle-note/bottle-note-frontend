import { useMutation } from '@tanstack/react-query';
import { ReviewApi } from '@/api/review/review.api';
import { RateApi } from '@/api/rate/rate.api';
import {
  createDefaultTastingProfile,
  toSubmitTastingProfile,
} from '@/api/review/tastingProfile';
import { uploadImages } from '@/utils/S3Upload';
import type { ReviewDraft } from './types';
import { getReviewTags, getReviewText } from '../_data/reviewHelpers';

const SIZE_TYPE = { glass: 'GLASS', bottle: 'BOTTLE' } as const;

/** 리뷰 등록 중 실패한 단계. 사진을 올리지 못했는지, 리뷰를 저장하지 못했는지 구분한다. */
export class ReviewSubmitError extends Error {
  constructor(
    readonly stage: 'image_upload' | 'review_save',
    cause: unknown,
  ) {
    super(stage, { cause });
  }
}

async function uploadReviewImages(review: ReviewDraft) {
  const photos = review.photos.length
    ? await uploadImages('review', review.photos)
    : [];
  return photos.map(({ viewUrl }, index) => ({
    order: index + 1,
    viewUrl,
  }));
}

/**
 * 사진을 올리고 리뷰를 저장한 뒤 별점을 남긴다.
 * 리뷰가 저장되면 성공으로 보고, 별점만 실패했으면 ratingSaved로 알린다.
 */
async function submitReview({
  alcoholId,
  review,
}: {
  alcoholId: number;
  review: ReviewDraft;
}) {
  let uploadedImages;
  try {
    uploadedImages = await uploadReviewImages(review);
  } catch (error) {
    throw new ReviewSubmitError('image_upload', error);
  }

  const defaultProfile = createDefaultTastingProfile();
  const tastingProfile = toSubmitTastingProfile({
    ...defaultProfile,
    axes: defaultProfile.axes.map((axis, index) => ({
      ...axis,
      score: review.tasting[index] ?? 0,
    })),
  });

  let reviewId: number;
  try {
    const response = await ReviewApi.registerReview({
      alcoholId: String(alcoholId),
      status: review.public ? 'PUBLIC' : 'PRIVATE',
      content: getReviewText(review),
      sizeType: review.price ? SIZE_TYPE[review.unit] : null,
      price: review.price ? Number(review.price) : null,
      imageUrlList: uploadedImages.length ? uploadedImages : null,
      tastingTagList: getReviewTags(review),
      tastingProfile,
      locationInfo: { locationName: review.place.trim() || null },
      rating: review.rating,
    });
    reviewId = response.data.id;
  } catch (error) {
    throw new ReviewSubmitError('review_save', error);
  }

  if (review.rating === 0) return { reviewId, ratingSaved: true };
  try {
    await RateApi.postRating({ alcoholId, rating: review.rating });
    return { reviewId, ratingSaved: true };
  } catch {
    return { reviewId, ratingSaved: false };
  }
}

export function useReviewSubmit() {
  return useMutation({ mutationFn: submitReview });
}
