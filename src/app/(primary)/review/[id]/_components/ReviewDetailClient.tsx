'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ReplyApi } from '@/api/reply/reply.api';
import NavLayout from '@/components/ui/Layout/NavLayout';
import useModalStore from '@/store/modalStore';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import { parseApiError } from '@/hooks/parseApiError';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useReviewDetailQuery } from '@/queries/useReviewDetailQuery';
import type { ReviewDetailsResponse } from '@/api/review/types';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';
import ReviewDetailsSkeleton from '@/components/ui/Loading/Skeletons/custom/ReviewDetailsSkeleton';
import ReplyForm from './Reply/ReplyForm';
import ReviewDetails from './ReviewDetails';
import AlcoholInfo from './AlcoholInfo';
import ReplyItemList from './Reply/ReplyItemList';

interface ReviewDetailClientProps {
  reviewId: string;
  initialData?: ReviewDetailsResponse;
}

export default function ReviewDetailClient({
  reviewId,
  initialData,
}: ReviewDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: isAuthLoading, user } = useAuthSession();
  const { handleLoginModal } = useModalStore();
  const { executeApiCall } = useSingleApiCall();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyListRef = useRef<HTMLDivElement>(null);
  const [isRefetch, setIsRefetch] = useState<boolean>(false);
  const [lastCreatedRootReplyId, setLastCreatedRootReplyId] = useState<
    number | null
  >(null);
  const [isUnmounting, setIsUnmounting] = useState(false);

  const {
    data: reviewData,
    error,
    isLoading,
    isFetchedAfterMount,
    refetch,
  } = useReviewDetailQuery({
    reviewId,
    initialData,
    enabled: !isAuthLoading,
    viewerId: user?.userId ?? null,
  });

  const alcoholInfo = reviewData?.alcoholInfo ?? null;
  const isPersonalizedReady = !isAuthLoading && isFetchedAfterMount;
  const reviewDetails = reviewData
    ? {
        reviewInfo: reviewData.reviewInfo,
        reviewImageList: reviewData.reviewImageList,
      }
    : null;

  const errorInfo = parseApiError(error);
  const errorMessage =
    errorInfo?.status === 404
      ? '삭제되었거나 존재하지 않는 리뷰입니다.'
      : '리뷰를 불러오는데 실패했습니다.';

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

  // 댓글 폼 초기화
  useEffect(() => {
    reset({
      content: '',
      parentReplyId: null,
      replyToReplyUserName: null,
      rootReplyId: null,
    });
  }, [reviewId, reset]);

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
      {errorInfo ? (
        <NavLayout>
          <SubHeader>
            <SubHeader.Left onClick={() => router.back()}>
              <Image
                src="/icon/arrow-left-subcoral.svg"
                alt="arrowIcon"
                width={23}
                height={23}
              />
            </SubHeader.Left>
            <SubHeader.Center>리뷰 상세보기</SubHeader.Center>
          </SubHeader>
          <ErrorFallback
            message={errorMessage}
            onBack={() => router.back()}
            onRetry={errorInfo.status !== 404 ? () => refetch() : undefined}
          />
        </NavLayout>
      ) : alcoholInfo && reviewDetails ? (
        <>
          <NavLayout>
            <div className="relative">
              <div
                className={`absolute inset-0 bg-mainCoral ${isUnmounting ? 'hidden' : ''}`}
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
                <AlcoholInfo
                  data={alcoholInfo}
                  handleLogin={handleLogin}
                  isPersonalizedReady={isPersonalizedReady}
                />
              )}
            </div>
            <ReviewDetails
              data={reviewDetails}
              alcoholId={alcoholInfo.alcoholId}
              handleLogin={handleLogin}
              isPersonalizedReady={isPersonalizedReady}
              onRefresh={() => refetch()}
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
            {isPersonalizedReady && (
              <ReplyForm
                textareaRef={textareaRef}
                handleCreateReply={handleCreateReply}
              />
            )}
          </NavLayout>
        </>
      ) : isLoading ? (
        <ReviewDetailsSkeleton />
      ) : null}
    </FormProvider>
  );
}
