'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useFormContext } from 'react-hook-form';
import { ReplyApi } from '@/app/api/ReplyApi';
import { truncStr } from '@/utils/truncStr';
import { formatDate } from '@/utils/formatDate';
import Label from '@/app/(primary)/_components/Label';
import OptionModal from '@/app/(primary)/_components/OptionModal';
import { RootReply, SubReply } from '@/types/Reply';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
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
  const { data: session } = useSession();
  const { setValue } = useFormContext();
  const { isShowModal, handleModal } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);

  const handleOptionsShow = () => {
    setIsOptionShow((prev) => !prev);
  };

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
        handleModal();
        setIsRefetch(true);
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
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
            {/* 삭제된 댓글에 대한 조건 추가 필요 API 수정되면 적용 예정 */}
            <button
              className="cursor-pointer"
              onClick={() => {
                setIsOptionShow(true);
              }}
            >
              <Image
                src="/icon/ellipsis-darkgray.svg"
                width={10}
                height={10}
                alt="report"
              />
            </button>
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
            {/* 삭제된 댓글에 대한 조건 추가 필요 API 수정되면 적용 예정 */}
            <button className="text-10 text-subCoral" onClick={updateReplyUser}>
              답글 달기
            </button>
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
      {/* 댓글, 대댓글 완료 후 일괄 modal 적용하면서 삭제 예정 컴포넌트 입니다. */}
      {isOptionShow && (
        <OptionModal
          options={
            session?.user?.userId === data?.userId
              ? [
                  {
                    name: '삭제하기',
                    action: () => {
                      // eslint-disable-next-line no-restricted-globals
                      const result = confirm('정말 댓글을 삭제하시겠습니까?');
                      if (result) deleteReply();
                    },
                  },
                ]
              : [
                  { name: '리뷰 신고', path: '' },
                  { name: '유저 신고', path: '' },
                ]
          }
          type={session?.user?.userId === data?.userId ? '댓글' : '신고하기'}
          handleClose={handleOptionsShow}
        />
      )}
      {isShowModal && (
        <Modal
          type="alert"
          handleConfirm={() => {
            handleModal();
            if (resetSubReplyToggle) {
              resetSubReplyToggle(false);
            }
          }}
          mainText="성공적으로 삭제되었습니다."
        />
      )}
    </>
  );
}

export default Reply;
