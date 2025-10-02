'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { ReviewApi } from '@/app/api/ReviewApi';
import { ReplyApi } from '@/app/api/ReplyApi';
import NavLayout from '@/app/(primary)/_components/NavLayout';
// import { shareOrCopy } from '@/utils/shareOrCopy';
import type {
  AlcoholInfo as AlcoholInfoType,
  ReviewDetailsWithoutAlcoholInfo,
} from '@/types/Review';
import useModalStore from '@/store/modalStore';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import ReviewDetailsSkeleton from '@/components/Skeletons/custom/ReviewDetailsSkeleton';
import ReplyInput from './_components/Reply/ReplyInput';
import ReviewDetails from './_components/ReviewDetails';
import AlcoholInfo from './_components/AlcoholInfo';
import ReplyList from './_components/Reply/ReplyList';

export default function ReviewDetail() {
  const router = useRouter();
  const { id: reviewId } = useParams();
  const searchParams = useSearchParams();
  const { handleLoginModal } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyListRef = useRef<HTMLDivElement>(null);
  const [alcoholInfo, setAlcoholInfo] = useState<AlcoholInfoType | null>(null);
  const [reviewDetails, setReviewDetails] =
    useState<ReviewDetailsWithoutAlcoholInfo | null>(null);
  const [isRefetch, setIsRefetch] = useState<boolean>(false);
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
        setIsRefetch(true);
        reset({
          content: '',
          parentReplyId: null,
          replyToReplyUserName: null,
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

  return (
    <FormProvider {...formMethods}>
      {alcoholInfo && reviewDetails && !isProcessing ? (
        <>
          <NavLayout>
            <div className="relative">
              {alcoholInfo.imageUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${alcoholInfo.imageUrl})`,
                  }}
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
              handleLogin={handleLogin}
              onRefresh={fetchReviewDetails}
              textareaRef={textareaRef}
            />
            <div ref={replyListRef}>
              <ReplyList
                reviewId={reviewId}
                isRefetch={isRefetch}
                setIsRefetch={setIsRefetch}
              />
            </div>
            <ReplyInput
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
