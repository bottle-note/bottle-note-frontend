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
import { uploadImages } from '@/utils/S3Upload';
import { RateApi } from '@/app/api/RateApi';

function ReviewModify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');
  const [alcoholId, setAlcoholId] = useState<string>('');
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
    watch,
    reset,
    formState: { isDirty, errors }, // 적용 필요
  } = formMethods;

  // console.log('errors', errors);

  const onSave = (data: FormValues) => {
    if (data.images !== null) {
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

    const originImgUrlList = watch('imageUrlList') ?? [];
    const newImgUrlList = imgUrl ?? [];

    // 리뷰 PATCH api
    const reviewParams = {
      status: data.status,
      content: data.review,
      sizeType: data.price ? data.price_type : null,
      price: data.price,
      imageUrlList:
        originImgUrlList.length > 0 || newImgUrlList.length > 0
          ? [...originImgUrlList, ...newImgUrlList]
          : null,
      tastingTagList: data.flavor_tags,
      locationInfo: {
        zipCode: data.zipCode,
        address: data.address,
        detailAddress: data.detailAddress,
      },
    };

    let ratingResult;
    let reviewResult;
    // 별점만 수정한 경우에 대한 조건 추가 필요
    if (initialRating !== data.rating) {
      ratingResult = await RateApi.postRating(ratingParams);
    }
    if (reviewId) {
      reviewResult = await ReviewApi.modifyReview(reviewId, reviewParams);
    }
    if (initialRating !== data.rating && ratingResult && reviewResult) {
      router.push(`/review/${reviewResult.reviewId}`);
    } else if (reviewResult) {
      // 대응에 대한 논의 필요
      // alert('별점은 등록되지 않았습니다.');
      router.push(`/review/${reviewResult.reviewId}`);
    } else if (initialRating !== data.rating && ratingResult) {
      // alert('리뷰는 등록되지 않았습니다.');
      router.back();
    }
  };

  useEffect(() => {
    (async () => {
      if (reviewId) {
        const result = await ReviewApi.getReviewDetails(reviewId);
        console.log(result);

        setAlcoholId(result.alcoholInfo.alcoholId.toString());
        setInitialRating(result.reviewResponse.rating);
        reset({
          review: result.reviewResponse.reviewContent,
          status: result.reviewResponse.status,
          price_type: result.reviewResponse.sizeType ?? 'GLASS',
          price: result.reviewResponse.price ?? null,
          flavor_tags: result.reviewResponse.reviewTastingTag ?? [],
          images: null,
          imageUrlList: result.reviewImageList ?? [],
          rating: result.reviewResponse.rating,
          zipCode: result.reviewResponse.zipCode,
          address: result.reviewResponse.address,
          detailAddress: result.reviewResponse.detailAddress,
        });
      }
    })();
  }, [reviewId, reset]);

  useEffect(() => {
    if (alcoholId) {
      (async () => {
        const result = await AlcoholsApi.getAlcoholDetails(
          alcoholId.toString(),
        );
        setAlcoholData(result.alcohols);
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
              리뷰 수정
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
            리뷰 수정
          </div>
        </article>
      </FormProvider>
    </>
  );
}

export default ReviewModify;
