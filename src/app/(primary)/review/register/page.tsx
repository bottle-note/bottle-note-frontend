'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import AlcoholInfo from '@/app/(primary)/review/_components/AlcoholInfo';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { AlcoholInfo as AlcoholDetails } from '@/types/Alcohol';
import { FormValues } from '@/types/Review';
import { ReviewApi } from '@/app/api/ReviewApi';
import { RateApi } from '@/app/api/RateApi';
import { uploadImages } from '@/utils/S3Upload';
import { Button } from '@/components/Button';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import ReviewForm from '../_components/ReviewForm';

function ReviewRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, handleModalState } = useModalStore();
  const alcoholId = searchParams.get('alcoholId') || '';
  const [alcoholData, setAlcoholData] = useState<AlcoholDetails | null>();
  const [initialRating, setInitialRating] = useState<number>(0);

  const schema = yup.object({
    review: yup.string().required('리뷰 내용을 작성해주세요.'),
    status: yup.string().required(),
    price: yup.number().nullable(),
    price_type: yup
      .string()
      .nullable()
      .transform((value) => (value === '' ? null : value))
      .when('price', {
        is: (price: number | null) => price !== null && price > 0,
        then: (schemaOne) =>
          schemaOne
            .oneOf(['GLASS', 'BOTTLE'] as const)
            .required('가격 타입을 선택해주세요.'),
        otherwise: (schemaTwo) =>
          schemaTwo.oneOf(['GLASS', 'BOTTLE', null] as const).nullable(),
      }),
  }) as yup.ObjectSchema<FormValues>;

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
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

  const onSubmit = async (
    data: FormValues,
    imgUrl?: { order: number; viewUrl: string }[],
  ) => {
    // 별점 POST api
    const ratingParams = {
      alcoholId,
      rating: data.rating ?? 0,
    };
    // 리뷰 POST api
    const reviewParams = {
      alcoholId,
      status: data.status,
      content: data.review,
      sizeType: data.price ? data.price_type : null,
      price: data.price,
      imageUrlList: imgUrl ?? null,
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
    if (initialRating !== data.rating) {
      ratingResult = await RateApi.postRating(ratingParams);
    }
    const reviewResult = await ReviewApi.registerReview(reviewParams);

    // error에 대해 추후 보완 예정
    if (
      (initialRating !== data.rating && ratingResult && reviewResult) ||
      (initialRating === data.rating && reviewResult) ||
      (initialRating !== data.rating && reviewResult && !ratingResult)
    ) {
      const text =
        initialRating !== data.rating && !ratingResult
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
    } else if (initialRating !== data.rating && ratingResult && !reviewResult) {
      // alert('리뷰는 등록되지 않았습니다.');
      router.back();
    }
  };

  const onUploadS3 = async (data: FormValues) => {
    const images = data?.images?.map((file) => file.image);

    if (images) {
      try {
        const PreSignedDBData = await uploadImages('review', images);
        onSubmit(data, PreSignedDBData);
      } catch (error) {
        console.error('S3 업로드 에러:', error);
      }
    }
  };

  const onSave = (data: FormValues) => {
    // console.log('data1', data);
    if (data.images?.length !== 0) {
      onUploadS3(data);
    } else {
      onSubmit(data);
    }
  };

  useEffect(() => {
    if (alcoholId) {
      (async () => {
        const alcoholResult = await AlcoholsApi.getAlcoholDetails(alcoholId);
        setAlcoholData(alcoholResult.alcohols);

        const ratingResult = await RateApi.getUserRating(alcoholId);
        setInitialRating(ratingResult.rating);
        reset((prev) => ({
          ...prev,
          rating: ratingResult.rating,
        }));
      })();
    }
  }, [alcoholId]);

  useEffect(() => {
    if (errors.review?.message || errors.price_type?.message) {
      handleModalState({
        isShowModal: true,
        mainText: errors.review?.message || errors.price_type?.message,
        type: 'ALERT',
      });
    }
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
        <article className="px-5 fixed bottom-2 center left-0 right-0">
          <Button onClick={handleSubmit(onSave)} btnName="리뷰 등록" />
        </article>
      </FormProvider>
      {state.isShowModal && <Modal />}
    </>
  );
}

export default ReviewRegister;
