import { useRouter } from 'next/navigation';
import { uploadImages } from '@/utils/S3Upload';
import { RateApi } from '@/api/rate/rate.api';
import { ReviewApi } from '@/api/review/review.api';
import type { ReviewTastingProfile } from '@/api/review/types';
import {
  isLegacyTastingGraphImage,
  toReviewTastingProfile,
} from '@/api/review/tastingProfile';
import useModalStore from '@/store/modalStore';
import { FormValues } from '@/types/Review';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';

interface UseReviewSubmissionProps {
  alcoholId: string;
  reviewId?: string;
  initialRating: number;
  removeSavedReview?: () => void;
  initialTastingProfile?: ReviewTastingProfile | null;
}

export const useReviewSubmission = ({
  alcoholId,
  reviewId,
  initialRating,
  removeSavedReview,
  initialTastingProfile,
}: UseReviewSubmissionProps) => {
  const router = useRouter();
  const { handleModalState, handleCloseModal } = useModalStore();

  const trackReviewFailure = (
    failureType: 'image_upload' | 'rating_save' | 'review_save',
  ) => {
    if (reviewId) return;
    trackGA4Event('write_review_failed', {
      alcohol_id: alcoholId,
      failure_type: failureType,
    });
  };

  const handleUploadImages = async (images: File[]) => {
    if (!images.length) return null;
    try {
      return await uploadImages('review', images);
    } catch (error) {
      console.error('S3 업로드 에러:', error);
      throw error;
    }
  };

  const createReviewParams = (
    data: FormValues,
    imageUrlList:
      | {
          order: number;
          viewUrl: string;
        }[]
      | null,
  ) => ({
    alcoholId,
    status: data.status,
    content: data.review,
    sizeType: data.price ? data.price_type : null,
    price: data.price,
    imageUrlList,
    tastingTagList: data.flavor_tags,
    tastingProfile:
      data.tastingNote == null
        ? initialTastingProfile ?? null
        : toReviewTastingProfile(data.tastingNote),
    locationInfo: {
      locationName: data.locationName,
      zipCode: data.zipCode,
      address: data.address,
      detailAddress: data.detailAddress,
      category: data.category,
      mapUrl: data.mapUrl,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    rating: data.rating ?? 0,
  });

  const handleRatingUpdate = async (rating: number) => {
    if (initialRating === rating) return null;
    return RateApi.postRating({
      alcoholId: Number(alcoholId),
      rating: rating ?? 0,
    });
  };

  const handleSuccess = (
    successReviewId: string,
    isNew: boolean,
    hasRatingError: boolean,
  ) => {
    const mainText = isNew
      ? '작성을 완료했습니다 👍'
      : '성공적으로 수정했습니다 👍';
    let subText = '';
    if (hasRatingError) {
      subText = '❗️별점 등록에는 실패했습니다. 다시 시도해주세요.';
    } else if (isNew) {
      subText = '여정에 한발 더 가까워지셨어요!';
    }

    handleModalState({
      isShowModal: true,
      mainText,
      subText,

      handleConfirm: () => {
        router.replace(`${ROUTES.REVIEW.DETAIL(successReviewId)}`);
        handleCloseModal();
        if (isNew && removeSavedReview) {
          removeSavedReview();
        }
      },
    });
  };

  const submitReview = async (
    data: FormValues,
    originImgUrlList: {
      order: number;
      viewUrl: string;
    }[] = [],
  ) => {
    let newImgUrlList = null;
    try {
      // 일반 리뷰 사진만 업로드한다. 테이스팅 프로필은 API 수치로 저장·표시한다.
      const userImages = data.images?.map((file) => file.image) ?? [];
      if (userImages.length > 0) {
        newImgUrlList = await handleUploadImages(userImages);
      }
    } catch (error) {
      trackReviewFailure('image_upload');
      throw error;
    }

    // 저장된 프로필을 새 그래프로 표시할 때만 과거 PNG를 목록에서 제외한다.
    // 프로필 없이 이미지로만 남아 있는 예전 리뷰는 사진을 보존한다.
    const hasProfile =
      data.tastingNote != null || initialTastingProfile != null;
    const originPhotos = hasProfile
      ? originImgUrlList.filter(
          (img) => !isLegacyTastingGraphImage(img.viewUrl),
        )
      : originImgUrlList;
    const finalImageUrlList =
      originPhotos.length > 0 || (newImgUrlList?.length ?? 0) > 0
        ? [...originPhotos, ...(newImgUrlList ?? [])]
        : null;

    const reviewParams = createReviewParams(data, finalImageUrlList);

    let ratingResult = null;
    try {
      ratingResult = await handleRatingUpdate(data.rating ?? 0);
    } catch (error) {
      trackReviewFailure('rating_save');
      throw error;
    }

    let reviewResult;
    try {
      reviewResult = reviewId
        ? await ReviewApi.modifyReview(reviewId, reviewParams)
        : await ReviewApi.registerReview(reviewParams);
    } catch (error) {
      trackReviewFailure('review_save');
      throw error;
    }

    if (reviewResult) {
      const hasRatingError = data.rating !== initialRating && !ratingResult;
      const resultReviewId =
        'id' in reviewResult.data
          ? reviewResult.data.id
          : reviewResult.data.reviewId;

      if (!reviewId) {
        trackGA4Event('write_review_complete', { alcohol_id: alcoholId });
      }

      handleSuccess(resultReviewId.toString(), !reviewId, hasRatingError);
    } else if (data.rating !== initialRating && ratingResult) {
      router.back();
    }
  };

  return { submitReview };
};
