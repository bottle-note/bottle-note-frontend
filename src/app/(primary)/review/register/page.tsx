'use client';

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import AlcoholInfo from '@/app/(primary)/review/_components/AlcoholInfo';
import { FormValues, ReviewTempData } from '@/types/Review';
import { reviewSchema } from '@/app/(primary)/review/_schemas/reviewFormSchema';
import { Button } from '@/components/Button';
import Loading from '@/components/Loading';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import { useAlcoholDetails } from '@/hooks/useAlcoholDetails';
import { useErrorModal } from '@/hooks/useErrorModal';
import { useReviewAutoSave } from '@/hooks/useReviewAutoSave';
import { useReviewSubmission } from '@/hooks/useReviewSubmission';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import SkeletonBase from '@/components/Skeletons/SkeletonBase';
import ReviewForm from '../_components/form/ReviewForm';

function ReviewRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();
  const alcoholId = searchParams.get('alcoholId') || '';
  const {
    alcoholData,
    userRating,
    isLoading: isAlcoholLoading,
  } = useAlcoholDetails(alcoholId);

  const defaultFormData: ReviewTempData['content'] = {
    review: '',
    status: 'PUBLIC',
    price: 0,
    price_type: null,
    flavor_tags: [],
    rating: userRating ?? null,
    images: [],
    imageUrlList: null,
    locationName: null,
    zipCode: null,
    address: null,
    detailAddress: null,
    category: null,
    mapUrl: null,
    latitude: null,
    longitude: null,
  };

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(reviewSchema as yup.ObjectSchema<FormValues>),
    defaultValues: defaultFormData,
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, errors },
  } = formMethods;

  const formValues = watch();

  const getCurrentData = useCallback((): ReviewTempData | null => {
    const currentFormData: ReviewTempData['content'] = {
      ...formValues,
      images: [],
      imageUrlList: null,
    };

    const isDefault =
      JSON.stringify(defaultFormData) === JSON.stringify(currentFormData);

    if (isDefault) {
      return null;
    }

    return {
      content: currentFormData,
      timestamp: Date.now(),
    };
  }, [formValues]);

  const handleLoad = useCallback(
    (savedData: ReviewTempData) => {
      reset(savedData.content);
    },
    [reset],
  );

  const { removeSavedReview, isToastVisible, toastMessage } = useReviewAutoSave(
    {
      alcoholId,
      onLoad: handleLoad,
      getCurrentData,
      shouldSave: (data) => data !== null,
    },
  );

  const { submitReview } = useReviewSubmission({
    alcoholId,
    initialRating: userRating,
    removeSavedReview,
  });

  const onSave = async (data: FormValues) => {
    await executeApiCall(() => submitReview(data));
  };

  useEffect(() => {
    if (!isAlcoholLoading && userRating) {
      reset((prev) => ({
        ...prev,
        rating: userRating,
      }));
    }
  }, [userRating, isAlcoholLoading]);

  const { showErrorModal } = useErrorModal<FormValues>(errors);

  useEffect(() => {
    showErrorModal(['review', 'price_type']);
  }, [errors]);

  return (
    <>
      <FormProvider {...formMethods}>
        <div className="relative min-h-screen">
          <div className="fixed inset-0 overflow-y-auto">
            {alcoholData ? (
              <div className="relative">
                {alcoholData?.alcoholUrlImg && (
                  <div
                    className="absolute w-full h-full  bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${alcoholData.alcoholUrlImg})`,
                    }}
                  />
                )}
                <div className="absolute w-full h-full bg-mainCoral bg-opacity-90" />
                <SubHeader bgColor="bg-mainCoral/10">
                  <SubHeader.Left
                    onClick={() => {
                      if (isDirty) {
                        handleModalState({
                          isShowModal: true,
                          mainText:
                            '작성 중인 내용이 있습니다.\n정말 뒤로 가시겠습니까?',
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
                    }}
                  >
                    <Image
                      src="/icon/arrow-left-white.svg"
                      alt="arrowIcon"
                      width={23}
                      height={23}
                    />
                  </SubHeader.Left>
                  <SubHeader.Center textColor="text-white">
                    리뷰 작성
                  </SubHeader.Center>
                </SubHeader>
                {alcoholData && <AlcoholInfo data={alcoholData} />}
              </div>
            ) : (
              <SkeletonBase height={330} className="w-full" />
            )}
            <ReviewForm />
            <article className="sticky bottom-3 px-5 z-10">
              <Button
                onClick={handleSubmit(onSave)}
                btnName="리뷰 등록"
                disabled={isProcessing}
              />
            </article>
          </div>
        </div>
        {isToastVisible && <Toast message={toastMessage} />}
      </FormProvider>
      {isProcessing && <Loading />}
      <Modal />
    </>
  );
}

export default ReviewRegister;
