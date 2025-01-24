import { useRouter } from 'next/navigation';
import { uploadImages } from '@/utils/S3Upload';
import { RateApi } from '@/app/api/RateApi';
import { ReviewApi } from '@/app/api/ReviewApi';
import useModalStore from '@/store/modalStore';
import { FormValues } from '@/types/Review';

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
  const { handleModalState } = useModalStore();

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
      type: 'ALERT',
      handleConfirm: () => {
        router.push(`/review/${successReviewId}`);
        handleModalState({
          isShowModal: false,
          mainText: '',
          subText: '',
        });
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
    if (data.images?.length !== 0) {
      newImgUrlList = await handleUploadImages(
        data.images?.map((file) => file.image) ?? [],
      );
    }

    const finalImageUrlList =
      originImgUrlList?.length > 0 || (newImgUrlList?.length ?? 0) > 0
        ? [...originImgUrlList, ...(newImgUrlList ?? [])]
        : null;

    const reviewParams = createReviewParams(data, finalImageUrlList);

    const ratingResult = await handleRatingUpdate(data.rating ?? 0);

    const reviewResult = reviewId
      ? await ReviewApi.modifyReview(reviewId, reviewParams)
      : await ReviewApi.registerReview(reviewParams);

    if (reviewResult) {
      const hasRatingError = data.rating !== initialRating && !ratingResult;
      const resultReviewId =
        'id' in reviewResult ? reviewResult.id : reviewResult.reviewId;
      handleSuccess(resultReviewId.toString(), !reviewId, hasRatingError);
    } else if (data.rating !== initialRating && ratingResult) {
      router.back();
    }
  };

  return { submitReview };
};
