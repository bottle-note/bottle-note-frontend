import { useRouter } from 'next/navigation';
import { uploadImages } from '@/utils/S3Upload';
import { RateApi } from '@/api/rate/rate.api';
import { ReviewApi } from '@/api/review/review.api';
import type { ReviewTastingProfile } from '@/api/review/types';
import { toReviewTastingProfile } from '@/api/review/tastingProfile';
import useModalStore from '@/store/modalStore';
import { FormValues } from '@/types/Review';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { captureTastingNote } from './useTastingNoteCapture';

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
    let chartImgUrlList = null;
    try {
      // 유저 이미지 업로드
      const userImages = data.images?.map((file) => file.image) ?? [];
      const existingPhotoCount = originImgUrlList.filter(
        (img) => !img.viewUrl.includes('tasting-graph'),
      ).length;
      if (userImages.length > 0) {
        newImgUrlList = await handleUploadImages(userImages);
      }

      // 이미지 제한(5장) 안에서만 차트 이미지를 함께 보관한다.
      // 차트 이미지를 올리지 못한 경우에도 tastingProfile로 상세 화면에 표시할 수 있다.
      if (existingPhotoCount + userImages.length < 5) {
        const chartFile = await captureTastingNote(data.tastingNote);
        if (chartFile) {
          chartImgUrlList = await uploadImages('tastingGraph', [chartFile]);
        }
      }
    } catch (error) {
      trackReviewFailure('image_upload');
      throw error;
    }

    // 그래프를 수정하거나 초기화한 경우 기존 차트 이미지를 교체/제거
    const filteredOriginList =
      data.tastingNote != null
        ? originImgUrlList.filter(
            (img) => !img.viewUrl.includes('tasting-graph'),
          )
        : originImgUrlList;

    const finalImageUrlList =
      filteredOriginList.length > 0 ||
      (newImgUrlList?.length ?? 0) > 0 ||
      (chartImgUrlList?.length ?? 0) > 0
        ? [
            ...filteredOriginList,
            ...(newImgUrlList ?? []),
            ...(chartImgUrlList ?? []),
          ]
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
