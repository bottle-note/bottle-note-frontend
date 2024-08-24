'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
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
import Loading from '@/components/Loading';
import { shareOrCopy } from '@/utils/shareOrCopy';
import type {
  AlcoholInfo as AlcoholInfoType,
  ReviewDetailsWithoutAlcoholInfo,
} from '@/types/Review';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import LoginModal from '@/app/(primary)/_components/LoginModal';
import ReplyInput from './_components/Reply/ReplyInput';
import ReviewDetails from './_components/ReviewDetails';
import AlcoholInfo from './_components/AlcoholInfoDisplay';
import ReplyList from './_components/Reply/ReplyList';

export default function ReviewDetail() {
  const router = useRouter();
  const { id: reviewId } = useParams();
  const { isShowModal, handleModal } = useModalStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [alcoholInfo, setAlcoholInfo] = useState<AlcoholInfoType | null>(null);
  const [reviewDetails, setReviewDetails] =
    useState<ReviewDetailsWithoutAlcoholInfo | null>(null);
  const [modalType, setModalType] = useState<'copy' | 'login' | null>(null);
  const [isRefetch, setIsRefetch] = useState<boolean>(false);
  // 대댓글 수정하며 같이 리팩토링 예정
  const [isSubReplyShow, setIsSubReplyShow] = useState(false);

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
    setModalType('login');
    handleModal();
  };

  const handleShare = () => {
    setModalType('copy');
    handleModal();
  };

  const resetSubReplyToggle = (value?: boolean) => {
    if (value) {
      setIsSubReplyShow(value);
    } else {
      setIsSubReplyShow((prev) => !prev);
    }
  };

  const handleCreateReply: SubmitHandler<FieldValues> = async (data) => {
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
      setIsSubReplyShow(false);
      reset({
        content: '',
        parentReplyId: null,
        replyToReplyUserName: null,
      });
    }
  };

  useEffect(() => {
    async function fetchReviewDetails() {
      // reviewId가 없을 때, 별도 페이지 처리가 필요한가?
      if (!reviewId) return;
      try {
        const result = await ReviewApi.getReviewDetails(reviewId);
        const { alcoholInfo: response, ...restData } = result;
        setAlcoholInfo(response);
        setReviewDetails(restData);
      } catch (error) {
        console.error('Failed to fetch review details:', error);
      }
    }

    fetchReviewDetails();

    reset({
      content: '',
      parentReplyId: null,
      replyToReplyUserName: null,
    });
  }, [reviewId]);

  return (
    <>
      <FormProvider {...formMethods}>
        {alcoholInfo && reviewDetails ? (
          <>
            <NavLayout>
              <div className="relative pb-5">
                {alcoholInfo.imageUrl && (
                  <div
                    className="absolute w-full h-full  bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${alcoholInfo.imageUrl})`,
                    }}
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
                    리뷰 상세보기
                  </SubHeader.Center>
                  <SubHeader.Right
                    onClick={() => {
                      setModalType('copy');
                      shareOrCopy(
                        `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_URL}/review/${reviewId}`,
                        handleModal,
                        `${alcoholInfo.korName} 리뷰`,
                        `${alcoholInfo.korName} 리뷰 상세보기`,
                      );
                    }}
                  >
                    <Image
                      src="/icon/externallink-outlined-white.svg"
                      alt="linkIcon"
                      width={23}
                      height={23}
                    />
                  </SubHeader.Right>
                </SubHeader>
                {alcoholInfo && (
                  <AlcoholInfo data={alcoholInfo} handleLogin={handleLogin} />
                )}
              </div>
              <ReviewDetails
                data={reviewDetails}
                handleShare={handleShare}
                handleLogin={handleLogin}
                textareaRef={textareaRef}
              />
              <ReplyList
                reviewId={reviewId}
                isRefetch={isRefetch}
                setIsRefetch={setIsRefetch}
                isSubReplyShow={isSubReplyShow}
                resetSubReplyToggle={resetSubReplyToggle}
              />
              <ReplyInput
                textareaRef={textareaRef}
                handleCreateReply={handleCreateReply}
              />
            </NavLayout>
            {isShowModal && modalType === 'copy' && (
              <Modal
                mainText="해당 페이지 링크를 복사했습니다."
                subText="친구에게 공유하러 가볼까요?"
              />
            )}
            {isShowModal && modalType === 'login' && (
              <LoginModal handleClose={handleModal} />
            )}
          </>
        ) : (
          <Loading />
        )}
      </FormProvider>
    </>
  );
}
