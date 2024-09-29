'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFormContext } from 'react-hook-form';
import { ReplyApi } from '@/app/api/ReplyApi';
import { truncStr } from '@/utils/truncStr';
import { formatDate } from '@/utils/formatDate';
import Label from '@/app/(primary)/_components/Label';
import OptionDropdown from '@/components/OptionDropdown';
import { RootReply, SubReply } from '@/types/Reply';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { useAuth } from '@/utils/useAuth';
import userImg from 'public/user_img.png';

interface Props {
  data: RootReply | SubReply;
  children?: React.ReactNode;
  getSubReplyList?: (rootReplyId: number) => void;
  isReviewUser: boolean;
  reviewId: string | string[];
  setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isSubReplyShow?: boolean;
  resetSubReplyToggle?: (value?: boolean) => void;
}

function Reply({
  data,
  children,
  getSubReplyList,
  isReviewUser,
  reviewId,
  setIsRefetch,
  isSubReplyShow = false,
  resetSubReplyToggle,
}: Props) {
  const { isLogin, userData } = useAuth();
  const { setValue } = useFormContext();
  const { state, handleModalState, handleLoginModal } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);

  const handleUpdateSubReply = () => {
    if (resetSubReplyToggle) {
      resetSubReplyToggle();
    }
    if (getSubReplyList) getSubReplyList(data?.reviewReplyId);
  };

  const updateReplyUser = () => {
    if (data?.nickName && data?.reviewReplyId) {
      setValue('replyToReplyUserName', data.nickName);
      setValue('parentReplyId', data.reviewReplyId);
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
            // refresh review list
            setIsRefetch(true);
            if (resetSubReplyToggle) {
              resetSubReplyToggle(false);
            }
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
    } else if (option.type === 'REPORT') {
      handleModalState({
        isShowModal: true,
        mainText: '준비 중인 기능입니다.',
      });
    } else if (option.type === 'USER_REPORT') {
      handleModalState({
        isShowModal: true,
        mainText: '준비 중인 기능입니다.',
      });
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Link href={`/user/${data?.userId}`}>
            <div className="flex items-center space-x-1">
              <div className="w-[1.4rem] h-[1.4rem] rounded-full overflow-hidden">
                <Image
                  className="object-cover"
                  src={data?.imageUrl || userImg}
                  alt="user_img"
                  width={22}
                  height={22}
                />
              </div>
              <p className="text-mainGray text-10">
                {truncStr(data?.nickName, 12)}
              </p>
              {isReviewUser && (
                <Label
                  name="리뷰 작성자"
                  styleClass="border-mainCoral text-mainCoral px-1.5 py-0.5 rounded text-9"
                />
              )}
            </div>
          </Link>
          <div className="flex justify-between">
            <p className="text-mainGray text-10">
              {formatDate(data?.createAt)}
            </p>
            {data?.status !== 'DELETED' && (
              <button
                className="cursor-pointer"
                onClick={() => {
                  if (isLogin) setIsOptionShow(true);
                  else handleLoginModal();
                }}
              >
                <Image
                  src="/icon/ellipsis-darkgray.svg"
                  width={10}
                  height={10}
                  alt="report"
                />
              </button>
            )}
          </div>
        </div>
        <div className="text-10 text-mainDarkGray whitespace-pre-wrap break-words flex">
          <div className="text-mainCoral mr-1">
            {'rootReviewId' in data && `@${data?.nickName}`}
          </div>
          {data?.reviewReplyContent}
        </div>
        <div className="space-y-1">
          <div className="flex space-x-2">
            {data?.status !== 'DELETED' && (
              <button
                className="text-10 text-subCoral"
                onClick={updateReplyUser}
              >
                답글 달기
              </button>
            )}
            {'subReplyCount' in data && data?.subReplyCount !== 0 && (
              <button
                className="flex items-center space-x-[2px]"
                onClick={handleUpdateSubReply}
              >
                <div className="text-10 text-subCoral">
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
            )}
          </div>
          {'subReplyCount' in data &&
            data?.subReplyCount !== 0 &&
            isSubReplyShow && <div className="space-y-3">{children}</div>}
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
              : [
                  { name: '리뷰 신고', type: 'REPORT' },
                  { name: '유저 신고', type: 'USER_REPORT' },
                ]
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
