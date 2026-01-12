'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import * as yup from 'yup';
import {
  useForm,
  FormProvider,
  FieldValues,
  SubmitHandler,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormValues } from '@/types/Reply';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import { ReviewApi } from '@/app/api/ReviewApi';
import { ReplyApi } from '@/app/api/ReplyApi';
import JsonLd from '@/components/seo/JsonLd';
import { generateReviewSchema } from '@/utils/seo/generateReviewSchema';
import NavLayout from '@/components/ui/Layout/NavLayout';
// import { shareOrCopy } from '@/utils/shareOrCopy';
import type {
  AlcoholInfo as AlcoholInfoType,
  ReviewDetailsWithoutAlcoholInfo,
} from '@/types/Review';
import useModalStore from '@/store/modalStore';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import ReviewDetailsSkeleton from '@/components/ui/Loading/Skeletons/custom/ReviewDetailsSkeleton';
import ReplyForm from './_components/Reply/ReplyForm';
import ReviewDetails from './_components/ReviewDetails';
import AlcoholInfo from './_components/AlcoholInfo';
import ReplyItemList from './_components/Reply/ReplyItemList';

export default function ReviewDetail() {
  const router = useRouter();
  const { id: reviewId } = useParams();
  const searchParams = useSearchParams();
  const { handleLoginModal } = useModalStore();
  const { executeApiCall } = useSingleApiCall();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyListRef = useRef<HTMLDivElement>(null);
  const [alcoholInfo, setAlcoholInfo] = useState<AlcoholInfoType | null>(null);
  const [reviewDetails, setReviewDetails] =
    useState<ReviewDetailsWithoutAlcoholInfo | null>(null);
  const [isRefetch, setIsRefetch] = useState<boolean>(false);
  const [lastCreatedRootReplyId, setLastCreatedRootReplyId] = useState<
    number | null
  >(null);
  const [isUnmounting, setIsUnmounting] = useState(false);

  const schema = yup.object({
    content: yup.string().required('댓글 내용을 입력해주세요.'),
    parentReplyId: yup.string().nullable(),
  });

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { reset } = formMethods;

  const handleLogin = () => {
    handleLoginModal();
  };

  const handleCreateReply: SubmitHandler<FieldValues> = async (data) => {
    const processSubmission = async () => {
      let saveContent = data.content;
      let saveParentReplyId = data.parentReplyId;

      const replyToReplyUserName = data.content.match(/@(\S+?)\s/);

      if (
        replyToReplyUserName &&
        replyToReplyUserName[1] === data.replyToReplyUserName
      ) {
        saveContent = data.content.replace(/@(\S+?)\s/, '');
      } else {
        saveParentReplyId = null;
      }

      const replyParams = {
        content: saveContent,
        parentReplyId: saveParentReplyId,
      };

      const response = await ReplyApi.registerReply(
        reviewId as string,
        replyParams,
      );

      if (response) {
        setLastCreatedRootReplyId(data.rootReplyId ? data.rootReplyId : null);
        setIsRefetch(true);
        reset({
          content: '',
          parentReplyId: null,
          replyToReplyUserName: null,
          rootReplyId: null,
        });
      }
    };

    await executeApiCall(processSubmission);
  };

  const fetchReviewDetails = useCallback(async () => {
    if (!reviewId) return;
    try {
      const result = await ReviewApi.getReviewDetails(reviewId);
      const { alcoholInfo: response, ...restData } = result;
      setAlcoholInfo(response);
      setReviewDetails(restData);
    } catch (error) {
      console.error('Failed to fetch review details:', error);
    }
  }, [reviewId]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchReviewDetails();
    reset({
      content: '',
      parentReplyId: null,
      replyToReplyUserName: null,
      rootReplyId: null,
    });
  }, [reviewId, reset, fetchReviewDetails]);

  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (
      scrollTo === 'replies' &&
      replyListRef.current &&
      alcoholInfo &&
      reviewDetails
    ) {
      setTimeout(() => {
        replyListRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    }
  }, [searchParams, alcoholInfo, reviewDetails]);

  useEffect(() => {
    return () => {
      setIsUnmounting(true);
    };
  }, []);

  const reviewSchema = useMemo(() => {
    return alcoholInfo && reviewDetails?.reviewInfo
      ? generateReviewSchema(alcoholInfo, reviewDetails.reviewInfo)
      : null;
  }, [alcoholInfo, reviewDetails?.reviewInfo]);

  return (
    <FormProvider {...formMethods}>
      {reviewSchema && <JsonLd data={reviewSchema} />}
      {alcoholInfo && reviewDetails ? (
        <>
          <NavLayout>
            <div className="relative">
              {alcoholInfo.imageUrl && (
                <Image
                  src={alcoholInfo.imageUrl}
                  alt="배경 이미지"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              )}
              <div
                className={`absolute inset-0 bg-mainCoral bg-opacity-90 ${isUnmounting ? 'hidden' : ''}`}
              />
              <div className="relative z-10">
                <SubHeader bgColor="bg-none">
                  <SubHeader.Left onClick={() => router.back()}>
                    <Image
                      src="/icon/arrow-left-white.svg"
                      alt="arrowIcon"
                      width={23}
                      height={23}
                    />
                  </SubHeader.Left>
                  <SubHeader.Center textColor="text-white">
                    리뷰 상세보기
                  </SubHeader.Center>
                </SubHeader>
              </div>
              {alcoholInfo && (
                <AlcoholInfo data={alcoholInfo} handleLogin={handleLogin} />
              )}
            </div>
            <ReviewDetails
              data={reviewDetails}
              alcoholId={alcoholInfo.alcoholId}
              handleLogin={handleLogin}
              onRefresh={fetchReviewDetails}
              textareaRef={textareaRef}
            />
            <div ref={replyListRef}>
              <ReplyItemList
                reviewUserId={reviewDetails.reviewInfo.userInfo.userId}
                reviewId={reviewId}
                isRefetch={isRefetch}
                setIsRefetch={setIsRefetch}
                lastCreatedRootReplyId={lastCreatedRootReplyId}
              />
            </div>
            <ReplyForm
              textareaRef={textareaRef}
              handleCreateReply={handleCreateReply}
            />
          </NavLayout>
        </>
      ) : (
        <ReviewDetailsSkeleton />
      )}
    </FormProvider>
  );
}
