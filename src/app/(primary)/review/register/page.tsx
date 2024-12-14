'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import AlcoholInfo from '@/app/(primary)/review/_components/AlcoholInfo';
import { FormValues } from '@/types/Review';
import { ReviewApi } from '@/app/api/ReviewApi';
import { RateApi } from '@/app/api/RateApi';
import { reviewSchema } from '@/app/(primary)/review/_schemas/reviewFormSchema';
import { uploadImages } from '@/utils/S3Upload';
import { Button } from '@/components/Button';
import Loading from '@/components/Loading';
import { useCallOnce } from '@/hooks/useCallOnce';
import { useAlcoholDetails } from '@/hooks/useAlcoholDetails';
import { useErrorModal } from '@/hooks/useErrorModal';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import ReviewForm from '../_components/form/ReviewForm';

function ReviewRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useCallOnce();
  const alcoholId = searchParams.get('alcoholId') || '';
  const {
    alcoholData,
    userRating,
    isLoading: isAlcoholLoading,
  } = useAlcoholDetails(alcoholId);

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(reviewSchema as yup.ObjectSchema<FormValues>),
    defaultValues: {
      review: '',
      status: 'PUBLIC',
      price: null,
      price_type: null,
      flavor_tags: [],
      rating: null,
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
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = formMethods;

  const onSave = async (data: FormValues) => {
    const processSubmission = async () => {
      let uploadedImageUrls = null;
      if (data.images?.length !== 0) {
        const images = data?.images?.map((file) => file.image);
        if (images) {
          try {
            uploadedImageUrls = await uploadImages('review', images);
          } catch (error) {
            console.error('S3 업로드 에러:', error);
            throw error;
          }
        }
      }

      const ratingParams = {
        alcoholId,
        rating: data.rating ?? 0,
      };

      const reviewParams = {
        alcoholId,
        status: data.status,
        content: data.review,
        sizeType: data.price ? data.price_type : null,
        price: data.price,
        imageUrlList: uploadedImageUrls ?? null,
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
      };

      let ratingResult = null;
      if (userRating !== data.rating) {
        ratingResult = await RateApi.postRating(ratingParams);
      }

      const reviewResult = await ReviewApi.registerReview(reviewParams);

      // 결과 처리 리팩토링 필수로 해야함..!
      if (
        (userRating !== data.rating && ratingResult && reviewResult) ||
        (userRating === data.rating && reviewResult) ||
        (userRating !== data.rating && reviewResult && !ratingResult)
      ) {
        const text =
          userRating !== data.rating && !ratingResult
            ? '❗️별점 등록에는 실패했습니다. 다시 시도해주세요.'
            : '여정에 한발 더 가까워지셨어요!';
        handleModalState({
          isShowModal: true,
          mainText: '작성을 완료했습니다 👍',
          subText: text,
          type: 'ALERT',
          handleConfirm: () => {
            router.push(`/review/${reviewResult.id}`);
            handleModalState({
              isShowModal: false,
              mainText: '',
            });
          },
        });
      } else if (userRating !== data.rating && ratingResult && !reviewResult) {
        router.back();
      }
    };

    await executeApiCall(processSubmission);
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
        <div className="relative">
          {alcoholData?.alcoholUrlImg && (
            <div
              className="absolute w-full h-full  bg-cover bg-center"
              style={{ backgroundImage: `url(${alcoholData.alcoholUrlImg})` }}
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
                      '작성 중인 내용이 사라집니다.\n정말 뒤로 가시겠습니까?',
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
        {alcoholData && <ReviewForm korName={alcoholData.korName} />}
        <article className="px-5 fixed bottom-5 center left-0 right-0">
          <Button
            onClick={handleSubmit(onSave)}
            btnName="리뷰 등록"
            disabled={isProcessing}
          />
        </article>
      </FormProvider>
      {(isProcessing || !alcoholData) && <Loading />}
      {state.isShowModal && <Modal />}
    </>
  );
}

export default ReviewRegister;
