'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import * as yup from 'yup';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import AlcoholInfo from '@/app/(primary)/review/_components/AlcoholInfo';
import ReviewForm from '../_components/ReviewForm';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { AlcoholInfo as AlcoholDetails } from '@/types/Alcohol';
import { FormValues } from '@/types/Review';
import { ReviewApi } from '@/app/api/ReviewApi';
import { RateApi } from '@/app/api/RateApi';
import { uploadImages } from '@/utils/S3Upload';

function ReviewRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alcoholId = searchParams.get('alcoholId') || '';
  const [alcoholData, setAlcoholData] = useState<AlcoholDetails>();
  const [initialRating, setInitialRating] = useState<number>(0);

  const schema = yup.object({
    review: yup.string().required('리뷰 내용을 작성해주세요.'),
    status: yup.string().required(),
    price_type: yup
      .mixed<'GLASS' | 'BOTTLE'>()
      .oneOf(['GLASS', 'BOTTLE'])
      .required(),
  });

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, errors }, // 적용 필요
  } = formMethods;

  // console.log('errors', errors);

  const onSave = (data: FormValues) => {
    // console.log('data1', data);
    if (data.images?.length !== 0) {
      onUploadS3(data);
    } else {
      onSubmit(data);
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
        zipCode: data.zipCode,
        address: data.address,
        detailAddress: data.detailAddress,
      },
    };

    let ratingResult;
    if (initialRating !== data.rating) {
      ratingResult = await RateApi.postRating(ratingParams);
    }
    const reviewResult = await ReviewApi.registerReview(reviewParams);

    // error에 대해 추후 보완 예정
    if (initialRating !== data.rating && ratingResult && reviewResult) {
      router.push(`/review/${reviewResult.id}`);
    } else if (reviewResult) {
      // alert('별점은 등록되지 않았습니다.');
      router.push(`/review/${reviewResult.id}`);
    } else if (initialRating !== data.rating && ratingResult) {
      // alert('리뷰는 등록되지 않았습니다.');
      router.back();
    }
  };

  useEffect(() => {
    reset({
      review: '',
      status: 'PUBLIC',
      price_type: 'GLASS',
      price: null,
      flavor_tags: [],
      images: [],
      imageUrlList: null,
      zipCode: null,
      address: null,
      detailAddress: null,
    });
  }, []);

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

  // 추후 Modal로 수정 예정
  useEffect(() => {
    if (errors.review?.message) {
      alert(errors.review?.message);
    }
  }, [errors]);

  return (
    <>
      <FormProvider {...formMethods}>
        <div className="relative">
          {alcoholData?.alcoholUrlImg && (
            <div
              className={`absolute w-full h-full  bg-cover bg-center`}
              style={{ backgroundImage: `url(${alcoholData.alcoholUrlImg})` }}
            />
          )}
          <div className="absolute w-full h-full bg-mainCoral bg-opacity-90" />
          <SubHeader bgColor="bg-mainCoral/10">
            <SubHeader.Left
              onClick={() => {
                router.back();
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
          <div
            className="flex justify-center items-center w-full h-[3.8rem] bg-subCoral rounded-xl text-white font-bold text-base"
            onClick={handleSubmit(onSave)}
          >
            리뷰 등록
          </div>
        </article>
      </FormProvider>
    </>
  );
}

export default ReviewRegister;
