import { useMutation } from '@tanstack/react-query';
import { ReviewApi } from '@/api/review/review.api';
import { RateApi } from '@/api/rate/rate.api';
import { toReviewTastingProfile } from '@/api/review/tastingProfile';
import { TASTING_AXES, type TastingNoteValues } from '@/constants/tastingNote';
import { captureTastingNote } from '@/app/(primary)/review/hook/useTastingNoteCapture';
import { uploadImages } from '@/utils/S3Upload';
import type { ReviewDraft } from './types';
import { getReviewTags, getReviewText } from '../_data/reviewHelpers';

/** 리뷰 이미지는 사진과 테이스팅 그래프를 합쳐 5장까지 올린다. */
const MAX_IMAGES = 5;
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
  const tasting = Object.fromEntries(
    TASTING_AXES.map((axis, index) => [axis.key, review.tasting[index]]),
  ) as TastingNoteValues;
  // 그래프 이미지를 만들지 못해도 tastingProfile로 리뷰 상세에 그래프가 보인다.
  const chart =
    review.photos.length < MAX_IMAGES
      ? await captureTastingNote(tasting)
      : null;
  const chartImages = chart ? await uploadImages('tastingGraph', [chart]) : [];
  return {
    tasting,
    images: [...photos, ...chartImages].map(({ viewUrl }, index) => ({
      order: index + 1,
      viewUrl,
    })),
  };
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
  let uploaded;
  try {
    uploaded = await uploadReviewImages(review);
  } catch (error) {
    throw new ReviewSubmitError('image_upload', error);
  }

  let reviewId: number;
  try {
    const response = await ReviewApi.registerReview({
      alcoholId: String(alcoholId),
      status: review.public ? 'PUBLIC' : 'PRIVATE',
      content: getReviewText(review),
      sizeType: review.price ? SIZE_TYPE[review.unit] : null,
      price: review.price ? Number(review.price) : null,
      imageUrlList: uploaded.images.length ? uploaded.images : null,
      tastingTagList: getReviewTags(review),
      tastingProfile: toReviewTastingProfile(uploaded.tasting),
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
