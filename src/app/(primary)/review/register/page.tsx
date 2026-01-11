'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormValues, ReviewTempData } from '@/types/Review';
import { reviewSchema } from '@/app/(primary)/review/_schemas/reviewFormSchema';
import Button from '@/components/ui/Button/Button';
import Loading from '@/components/ui/Loading/Loading';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import { useAlcoholDetails } from '@/app/(primary)/review/hook/useAlcoholDetails';
import { useErrorModal } from '@/hooks/useErrorModal';
import { useReviewAutoSave } from '@/app/(primary)/review/hook/useReviewAutoSave';
import { useReviewSubmission } from '@/app/(primary)/review/hook/useReviewSubmission';
import useModalStore from '@/store/modalStore';
import Toast from '@/components/ui/Interactive/Toast';
import ReviewForm from '../_components/form/ReviewForm';
import ReviewHeaderLayout from '../_components/ReviewHeaderLayout';
import AlcoholSearchBottomSheet from '../_components/AlcoholSearchBottomSheet';

function ReviewRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();

  const initialAlcoholId = searchParams.get('alcoholId') || '';
  const [selectedAlcoholId, setSelectedAlcoholId] =
    useState<string>(initialAlcoholId);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const {
    alcoholData,
    userRating,
    isLoading: isAlcoholLoading,
  } = useAlcoholDetails(selectedAlcoholId);

  const defaultFormData: ReviewTempData['content'] = {
    review: '',
    status: 'PUBLIC',
    price: null,
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
      alcoholId: selectedAlcoholId,
      onLoad: handleLoad,
      getCurrentData,
      shouldSave: (data) => data !== null,
    },
  );

  const { submitReview } = useReviewSubmission({
    alcoholId: selectedAlcoholId,
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

  const handleSelectAlcohol = (alcoholId: string) => {
    setSelectedAlcoholId(alcoholId);
    setIsSearchOpen(false);
    router.replace(`/review/register?alcoholId=${alcoholId}`);
  };

  const handleBack = () => {
    if (!selectedAlcoholId) {
      router.back();
      return;
    }

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

  const hasSelectedAlcohol = selectedAlcoholId && alcoholData;
  const isEmptyState = !selectedAlcoholId;

  return (
    <FormProvider {...formMethods}>
      <ReviewHeaderLayout
        alcoholData={alcoholData}
        onBack={handleBack}
        headerTitle="리뷰 작성"
        isEmptyState={isEmptyState}
        onSelectAlcohol={() => setIsSearchOpen(true)}
      />

      {hasSelectedAlcohol ? (
        <>
          <ReviewForm />
          <article className="sticky bottom-5 px-5 z-10 flex justify-center">
            <Button
              onClick={handleSubmit(onSave)}
              btnName="리뷰 등록"
              disabled={isProcessing}
            />
          </article>
        </>
      ) : (
        <section className="flex flex-col items-center justify-center py-20 text-mainGray">
          <p className="text-14 text-center">
            위스키를 선택하면
            <br />
            리뷰를 작성할 수 있어요!
          </p>
        </section>
      )}

      <AlcoholSearchBottomSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAlcohol={handleSelectAlcohol}
      />

      {isToastVisible && <Toast message={toastMessage} />}
      {isProcessing && <Loading />}
    </FormProvider>
  );
}

export default ReviewRegister;
