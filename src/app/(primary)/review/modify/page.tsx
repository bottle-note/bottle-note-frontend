'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormValues } from '@/types/Review';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import { useAlcoholDetails } from '@/app/(primary)/review/hook/useAlcoholDetails';
import { useErrorModal } from '@/hooks/useErrorModal';
import { useReviewSubmission } from '@/app/(primary)/review/hook/useReviewSubmission';
import { reviewSchema } from '@/app/(primary)/review/_schemas/reviewFormSchema';
import { parseApiError } from '@/hooks/parseApiError';
import { useReviewDetailQuery } from '@/queries/useReviewDetailQuery';
import Button from '@/components/ui/Button/Button';
import useModalStore from '@/store/modalStore';
import Loading from '@/components/ui/Loading/Loading';
import ReviewDetailsSkeleton from '@/components/ui/Loading/Skeletons/custom/ReviewDetailsSkeleton';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';
import ReviewForm from '../_components/form/ReviewForm';
import ReviewHeaderLayout from '../_components/ReviewHeaderLayout';

function ReviewModify() {
  const router = useRouter();
  const { handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');

  const {
    data: reviewData,
    error,
    isLoading,
    refetch,
  } = useReviewDetailQuery({ reviewId: reviewId ?? undefined });

  const errorInfo = parseApiError(error);

  const alcoholId = reviewData?.alcoholInfo.alcoholId.toString() ?? '';
  const initialRating = reviewData?.reviewInfo.rating ?? 0;

  const { alcoholData } = useAlcoholDetails(alcoholId, 'modify');

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(reviewSchema as yup.ObjectSchema<FormValues>),
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { isDirty, errors },
  } = formMethods;

  const { submitReview } = useReviewSubmission({
    alcoholId,
    reviewId: reviewId ?? undefined,
    initialRating,
  });

  const onSave = async (data: FormValues) => {
    const originImgUrlList = watch('imageUrlList') ?? [];
    await executeApiCall(() => submitReview(data, originImgUrlList));
  };

  // 리뷰 데이터로 폼 초기화
  useEffect(() => {
    if (!reviewData) return;

    const { reviewInfo, reviewImageList } = reviewData;
    const locationInfo = reviewInfo.locationInfo || {};

    reset({
      review: reviewInfo.reviewContent,
      status: reviewInfo.status || 'PUBLIC',
      price_type: reviewInfo.sizeType || null,
      price: reviewInfo.price || null,
      flavor_tags: reviewInfo.tastingTagList || [],
      images: null,
      imageUrlList: reviewImageList || [],
      rating: reviewInfo.rating || 0,
      locationName: locationInfo.name,
      address: locationInfo.address,
      detailAddress: locationInfo.detailAddress || null,
      mapUrl: locationInfo.mapUrl || null,
    });
  }, [reviewData, reset]);

  const { showErrorModal } = useErrorModal<FormValues>(errors);

  useEffect(() => {
    showErrorModal(['review', 'price_type']);
  }, [errors]);

  const handleBack = () => {
    if (isDirty) {
      handleModalState({
        isShowModal: true,
        mainText: '작성 중인 내용이 있습니다.\n정말 뒤로 가시겠습니까?',
        type: 'CONFIRM',
        handleConfirm: () => handleModalState({ isShowModal: false }),
        handleCancel: () => {
          handleModalState({ isShowModal: false });
          router.back();
        },
      });
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return <ReviewDetailsSkeleton />;
  }

  if (errorInfo) {
    return (
      <ErrorFallback
        message="리뷰를 불러오는데 실패했습니다."
        onBack={() => router.back()}
        onRetry={errorInfo.status !== 404 ? () => refetch() : undefined}
      />
    );
  }

  return (
    <FormProvider {...formMethods}>
      <ReviewHeaderLayout
        alcoholData={alcoholData}
        onBack={handleBack}
        headerTitle="리뷰 수정"
      />
      <ReviewForm />
      <article
        className="sticky px-5 z-10 flex justify-center"
        style={{ bottom: 'var(--navbar-margin-bottom)' }}
      >
        <Button
          onClick={handleSubmit(onSave)}
          btnName="리뷰 수정"
          disabled={isProcessing}
        />
      </article>
      {isProcessing ? <Loading /> : null}
    </FormProvider>
  );
}

export default ReviewModify;
