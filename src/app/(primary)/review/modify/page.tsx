'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormValues } from '@/types/Review';
import { ReviewApi } from '@/app/api/ReviewApi';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import { useAlcoholDetails } from '@/hooks/useAlcoholDetails';
import { useErrorModal } from '@/hooks/useErrorModal';
import { useReviewSubmission } from '@/hooks/useReviewSubmission';
import { reviewSchema } from '@/app/(primary)/review/_schemas/reviewFormSchema';
import { Button } from '@/components/Button';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import ReviewForm from '../_components/form/ReviewForm';
import ReviewHeaderLayout from '../_components/ReviewHeaderLayout';

function ReviewModify() {
  const router = useRouter();
  const { state, handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');
  const [alcoholId, setAlcoholId] = useState<string>('');
  const [initialRating, setInitialRating] = useState<number>(0);
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

  useEffect(() => {
    (async () => {
      if (reviewId) {
        const result = await ReviewApi.getReviewDetails(reviewId);
        const { reviewInfo, reviewImageList } = result;
        const locationInfo = reviewInfo.locationInfo || {};

        setAlcoholId(result.alcoholInfo.alcoholId.toString());
        setInitialRating(result.reviewInfo.rating);

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
      }
    })();
  }, [reviewId, reset]);

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
        cancelBtnName: '예',
        confirmBtnName: '아니요',
        handleConfirm: () => {
          handleModalState({
            isShowModal: false,
          });
        },
        handleCancel: () => {
          handleModalState({
            isShowModal: false,
          });
          router.back();
        },
      });
    } else {
      router.back();
    }
  };

  return (
    <Suspense>
      <FormProvider {...formMethods}>
        <ReviewHeaderLayout
          alcoholData={alcoholData}
          onBack={handleBack}
          headerTitle="리뷰 수정"
        />
        <ReviewForm />
        <article className="px-5 fixed bottom-6 center left-0 right-0">
          <Button onClick={handleSubmit(onSave)} btnName="리뷰 수정" />
        </article>
      </FormProvider>
      {isProcessing && <Loading />}
      {state.isShowModal && <Modal />}
    </Suspense>
  );
}

export default ReviewModify;
