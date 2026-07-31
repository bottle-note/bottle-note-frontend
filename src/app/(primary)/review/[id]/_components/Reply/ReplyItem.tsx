'use client';

import React, { useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { ReplyApi } from '@/api/reply/reply.api';
import { useBlockActions } from '@/hooks/useBlockActions';
import { truncStr } from '@/utils/truncStr';
import { formatDate } from '@/utils/formatDate';
import Label from '@/components/ui/Display/Label';
import OptionDropdown from '@/components/ui/Modal/OptionDropdown';
import ProfileImage from '@/components/domain/user/ProfileImage';
import { RootReply, SubReply } from '@/types/Reply';
import useModalStore from '@/store/modalStore';
import useRelationshipsStore from '@/store/relationshipsStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';
import { LABEL_NAMES } from '@/constants/common';

interface Props {
  data: RootReply | SubReply;
  children?: React.ReactNode;
  isReviewUser: boolean;
  reviewId: string | string[];
  setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isSubReplyShow?: boolean;
  onToggleSubReply?: () => void;
}

const ReplyItem = memo(function ReplyItem({
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
  const { handleModalState, handleLoginModal, handleCloseModal } =
    useModalStore();
  const { isUserBlocked } = useRelationshipsStore();
  const { handleBlockUser, handleUnblockUser } = useBlockActions();

  const [isOptionShow, setIsOptionShow] = useState(false);
  const isBlocked = isUserBlocked(data?.userId.toString());

  const handleUpdateSubReply = () => {
    if (onToggleSubReply) {
      onToggleSubReply();
    }
  };

  const updateReplyUser = () => {
    if (data?.nickName) {
      setValue('replyToReplyUserName', data.nickName);
      setValue('parentReplyId', data.reviewReplyId);

      // rootReplyId 설정: SubReply면 rootReviewId 사용, RootReply면 자기 자신의 ID 사용
      if ('rootReviewId' in data) {
        setValue('rootReplyId', data.rootReviewId);
      } else {
        setValue('rootReplyId', data.reviewReplyId);
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
        setIsRefetch(true);

        handleModalState({
          isShowModal: true,
          mainText: '성공적으로 댓글이 삭제되었습니다.',
          type: 'ALERT',
          handleConfirm: () => {
            setIsOptionShow(false);
            handleCloseModal();
          },
        });
      }
    } catch (error) {
      console.error('Failed to delete reply:', error);
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
    } else if (option.type === 'USER_BLOCK') {
      handleBlockUser(String(data.userId), data.nickName);
    }
  };

  return (
    <>
      <div>
        {isBlocked ? (
          <div className="space-y-[10px] mb-2">
            <div className="flex items-center space-x-1">
              <div className="h-[22px] w-[22px] rounded-full bg-bg-disabled" />
              <p className="text-12 text-fg-neutral-muted">차단한 사용자</p>
            </div>
            <div className="flex items-center justify-between text-fg-neutral-muted">
              <div className="text-13">차단한 사용자의 리뷰입니다.</div>
              <button
                className="border-b border-stroke-neutral-weak text-13"
                onClick={() =>
                  handleUnblockUser(String(data?.userId), data.nickName)
                }
              >
                차단해제
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Link href={ROUTES.USER.BASE(data?.userId!)}>
                <div className="flex items-center space-x-[5px] h-8 px-">
                  <ProfileImage profileImgSrc={data?.imageUrl} size={22} />
                  <p className="text-12 font-bold text-fg-neutral-muted">
                    {truncStr(data?.nickName, 12)}
                  </p>
                  {isReviewUser && (
                    <Label
                      name={LABEL_NAMES.REVIEW_AUTHOR}
                      styleClass="rounded border border-stroke-brand-primary-solid bg-bg-layer-default px-[5.82px] py-[2.91px] text-9 text-fg-brand-primary"
                    />
                  )}
                </div>
              </Link>
              <div className="flex justify-between">
                <p className="text-11 text-fg-neutral-subtle">
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
                    <MoreVertical
                      aria-label="댓글 메뉴"
                      className="h-3.5 w-3.5 text-fg-neutral-muted"
                    />
                  </button>
                )}
              </div>
            </div>
            <div className="my-2 flex whitespace-pre-wrap break-words text-15 text-fg-neutral">
              {'rootReviewId' in data && (
                <div className="mr-1 text-fg-brand-primary">
                  {data?.parentReviewReplyAuthor}
                </div>
              )}
              {data?.reviewReplyContent}
            </div>
          </>
        )}
        <div className="space-y-[14px]">
          <div className="flex space-x-[6px] text-13">
            {data?.status !== 'DELETED' && !isBlocked && (
              <button
                className="text-fg-brand"
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
                {!isBlocked && data?.status !== 'DELETED' && (
                  <p className="text-fg-brand">·</p>
                )}
                <button
                  className="flex items-center space-x-[2px]"
                  onClick={handleUpdateSubReply}
                >
                  <div className="pr-[1px] text-fg-brand">
                    답글 {data?.subReplyCount}개
                  </div>
                  <Image
                    src={
                      isSubReplyShow
                        ? '/icon/arrow-up-subcoral.svg'
                        : '/icon/arrow-down-subcoral.svg'
                    }
                    alt="arrowUpIcon"
                    width={12}
                    height={12}
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
              : [
                  { name: '유저 신고', type: 'USER_REPORT' },
                  ...(isBlocked
                    ? []
                    : [{ name: '유저 차단', type: 'USER_BLOCK' }]),
                ]
          }
          handleOptionSelect={handleOptionSelect}
          title={userData?.userId === data.userId ? '내 댓글' : '신고하기'}
        />
      )}
    </>
  );
});

export default ReplyItem;
