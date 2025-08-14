'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormContext } from 'react-hook-form';
import { ReplyApi } from '@/app/api/ReplyApi';
import { truncStr } from '@/utils/truncStr';
import { formatDate } from '@/utils/formatDate';
import Label from '@/app/(primary)/_components/Label';
import OptionDropdown from '@/components/OptionDropdown';
import ProfileImage from '@/app/(primary)/_components/ProfileImage';
import { RootReply, SubReply } from '@/types/Reply';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';

interface Props {
  data: RootReply | SubReply;
  children?: React.ReactNode;
  isReviewUser: boolean;
  reviewId: string | string[];
  setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isSubReplyShow?: boolean;
  onToggleSubReply?: () => void;
}

function Reply({
  data,
  children,
  isReviewUser,
  reviewId,
  setIsRefetch,
  isSubReplyShow,
  onToggleSubReply,
}: Props) {
  const router = useRouter();
  const { isLoggedIn, user: userData } = useAuth();
  const { setValue } = useFormContext();
  const { state, handleModalState, handleLoginModal } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleUpdateSubReply = () => {
    if (onToggleSubReply) {
      onToggleSubReply();
    }
  };

  const updateReplyUser = () => {
    if (data?.nickName) {
      setValue('content', `@${data.nickName} `);
      setValue('replyToReplyUserName', data.nickName);
      setValue('parentReplyId', data.reviewReplyId);

      if (textareaRef?.current) {
        textareaRef.current.focus();
      }
    }
  };

  const deleteReply = async () => {
    if (!data?.reviewReplyId) return;
    try {
      const result = await ReplyApi.deleteReply(
        reviewId.toString(),
        data.reviewReplyId.toString(),
      );
      if (result) {
        await setIsRefetch(true);

        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '성공적으로 댓글이 삭제되었습니다.',
          handleConfirm: () => {
            setIsOptionShow(false);
            handleModalState({
              isShowModal: false,
              mainText: '',
            });
          },
        });
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const handleOptionSelect = (option: { name: string; type: string }) => {
    if (option.type === 'DELETE') {
      handleModalState({
        isShowModal: true,
        mainText: '정말 삭제하시겠습니까?',
        type: 'CONFIRM',
        handleConfirm: () => {
          deleteReply();
        },
      });
    } else if (option.type === 'USER_REPORT') {
      router.push(ROUTES.REPORT.USER(data.userId));
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <Link href={ROUTES.USER.BASE(data?.userId!)}>
            <div className="flex items-center space-x-[5px] h-8 px-">
              <ProfileImage profileImgSrc={data?.imageUrl} size={22} />
              <p className="text-mainGray text-12 font-bold">
                {truncStr(data?.nickName, 12)}
              </p>
              {isReviewUser && (
                <Label
                  name="리뷰 작성자"
                  styleClass="border-mainCoral text-mainCoral px-[5.82px] py-[2.91px] rounded text-9"
                />
              )}
            </div>
          </Link>
          <div className="flex justify-between">
            <p className="text-mainGray text-11">
              {formatDate(data?.createAt) as string}
            </p>
            {data?.status !== 'DELETED' && (
              <button
                className="cursor-pointer"
                onClick={() => {
                  if (isLoggedIn) setIsOptionShow(true);
                  else handleLoginModal();
                }}
              >
                <Image
                  src="/icon/ellipsis-darkgray.svg"
                  width={14}
                  height={14}
                  alt="report"
                />
              </button>
            )}
          </div>
        </div>
        <div className="text-12 text-mainDarkGray whitespace-pre-wrap break-words flex mt-[12px] mb-2">
          {'rootReviewId' in data && (
            <div className="text-mainCoral mr-1">
              {data?.parentReviewReplyAuthor}
            </div>
          )}
          {data?.reviewReplyContent}
        </div>
        <div className="space-y-[14px]">
          <div className="flex space-x-[6px]">
            {data?.status !== 'DELETED' && (
              <button
                className="text-10 text-subCoral"
                onClick={() => {
                  if (isLoggedIn) {
                    updateReplyUser();
                  } else {
                    handleLoginModal();
                  }
                }}
              >
                답글 달기
              </button>
            )}
            {'subReplyCount' in data && data?.subReplyCount !== 0 && (
              <>
                <p className="text-10 text-subCoral">·</p>
                <button
                  className="flex items-center space-x-[2px]"
                  onClick={handleUpdateSubReply}
                >
                  <div className="text-10 text-subCoral pr-[1px]">
                    답글 {data?.subReplyCount}개
                  </div>
                  <Image
                    src={
                      isSubReplyShow
                        ? '/icon/arrow-up-subcoral.svg'
                        : '/icon/arrow-down-subcoral.svg'
                    }
                    alt="arrowUpIcon"
                    width={10}
                    height={8}
                  />
                </button>
              </>
            )}
          </div>
          {'subReplyCount' in data &&
            data?.subReplyCount !== 0 &&
            isSubReplyShow && <div className="space-y-[14px]">{children}</div>}
        </div>
      </div>
      {isOptionShow && (
        <OptionDropdown
          handleClose={() => setIsOptionShow(false)}
          options={
            userData?.userId === data.userId
              ? [
                  // { name: '수정하기', type: 'MODIFY' },
                  { name: '삭제하기', type: 'DELETE' },
                ]
              : [{ name: '유저 신고', type: 'USER_REPORT' }]
          }
          handleOptionSelect={handleOptionSelect}
          title={userData?.userId === data.userId ? '내 댓글' : '신고하기'}
        />
      )}
      {state.isShowModal && <Modal />}
    </>
  );
}

export default Reply;
