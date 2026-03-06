import { useRouter } from 'next/navigation';
import { uploadImages } from '@/utils/S3Upload';
import { RateApi } from '@/api/rate/rate.api';
import { ReviewApi } from '@/api/review/review.api';
import useModalStore from '@/store/modalStore';
import { FormValues } from '@/types/Review';
import { ROUTES } from '@/constants/routes';
import { captureTastingNote } from './useTastingNoteCapture';

interface UseReviewSubmissionProps {
  alcoholId: string;
  reviewId?: string;
  initialRating: number;
  removeSavedReview?: () => void;
}

export const useReviewSubmission = ({
  alcoholId,
  reviewId,
  initialRating,
  removeSavedReview,
}: UseReviewSubmissionProps) => {
  const router = useRouter();
  const { handleModalState, handleCloseModal } = useModalStore();

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
      alcoholId,
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
    // 유저 이미지 업로드
    const userImages = data.images?.map((file) => file.image) ?? [];
    let newImgUrlList = null;
    if (userImages.length > 0) {
      newImgUrlList = await handleUploadImages(userImages);
    }

    // 테이스팅 노트 차트 이미지 생성 → 별도 경로(tasting-graph)로 업로드
    const chartFile = await captureTastingNote(data.tastingNote);
    let chartImgUrlList = null;
    if (chartFile) {
      chartImgUrlList = await uploadImages('tastingGraph', [chartFile]);
    }

    // 수정 시 기존 차트 이미지 제거 (새 차트로 교체)
    const filteredOriginList = originImgUrlList.filter(
      (img) => !img.viewUrl.includes('tasting-graph'),
    );

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

    const ratingResult = await handleRatingUpdate(data.rating ?? 0);

    const reviewResult = reviewId
      ? await ReviewApi.modifyReview(reviewId, reviewParams)
      : await ReviewApi.registerReview(reviewParams);

    if (reviewResult) {
      const hasRatingError = data.rating !== initialRating && !ratingResult;
      const resultReviewId =
        'id' in reviewResult.data
          ? reviewResult.data.id
          : reviewResult.data.reviewId;
      handleSuccess(resultReviewId.toString(), !reviewId, hasRatingError);
    } else if (data.rating !== initialRating && ratingResult) {
      router.back();
    }
  };

  return { submitReview };
};
