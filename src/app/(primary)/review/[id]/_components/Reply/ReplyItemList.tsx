import React, { useCallback, useEffect, useMemo, useState, memo } from 'react';
import type { RootReply, SubReply } from '@/api/reply/types';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ReplyApi } from '@/api/reply/reply.api';
import List from '@/components/feature/List/List';
import EmptyView from '@/components/ui/Display/EmptyView';
import { sortReplies } from '@/app/(primary)/review/utils/sortReplies';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import ReplyItem from './ReplyItem';

interface SubReplyListProps {
  reviewId: string | string[];
  rootReplyId: number;
  reviewUserId: number;
  setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  refreshToken: number;
  viewerUserId: number | null;
}

const SubReplyList = ({
  reviewId,
  rootReplyId,
  reviewUserId,
  setIsRefetch,
  isOpen,
  refreshToken,
  viewerUserId,
}: SubReplyListProps) => {
  const { data, targetRef, hasNextPage } = usePaginatedQuery<{
    reviewReplies: SubReply[];
  }>({
    queryKey: [
      'review-sub-reply',
      viewerUserId,
      reviewId,
      rootReplyId,
      refreshToken,
    ],
    queryFn: ({ pageParam }) =>
      ReplyApi.getSubReplyList({
        reviewId: String(reviewId),
        rootReplyId: String(rootReplyId),
        cursor: pageParam,
        size: 10,
      }),
    enabled: isOpen,
  });
  const subReplies = useMemo(
    () =>
      sortReplies(
        data?.flatMap((page) => page.data.reviewReplies) ?? [],
        rootReplyId,
      ),
    [data, rootReplyId],
  );

  if (!isOpen || subReplies.length === 0) return null;

  return (
    <>
      {subReplies.map((subComment) => (
        <div
          key={`sub-${subComment.reviewReplyId}`}
          className="relative ml-[6px]"
        >
          <div className="absolute top-0 h-full w-px bg-stroke-neutral-subtle" />
          <div className="ml-4">
            <ReplyItem
              data={subComment}
              isReviewUser={reviewUserId === subComment.userId}
              reviewId={reviewId}
              setIsRefetch={setIsRefetch}
            />
          </div>
        </div>
      ))}
      {hasNextPage && <div ref={targetRef} className="h-1" />}
    </>
  );
};

const RootReplyItemMemo = memo(
  ({
    comment,
    reviewUserId,
    reviewId,
    setIsRefetch,
    isSubReplyShow,
    onToggleSubReply,
    subReplyRefreshToken,
    viewerUserId,
  }: {
    comment: RootReply;
    reviewUserId: number;
    reviewId: string | string[];
    setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
    isSubReplyShow: boolean;
    onToggleSubReply: (id: number) => void;
    subReplyRefreshToken: number;
    viewerUserId: number | null;
  }) => {
    const handleToggle = useCallback(() => {
      onToggleSubReply(comment.reviewReplyId);
    }, [onToggleSubReply, comment.reviewReplyId]);

    return (
      <ReplyItem
        data={comment}
        isReviewUser={reviewUserId === comment.userId}
        reviewId={reviewId}
        setIsRefetch={setIsRefetch}
        isSubReplyShow={isSubReplyShow}
        onToggleSubReply={handleToggle}
      >
        <SubReplyList
          reviewId={reviewId}
          rootReplyId={comment.reviewReplyId}
          reviewUserId={reviewUserId}
          setIsRefetch={setIsRefetch}
          isOpen={isSubReplyShow}
          refreshToken={subReplyRefreshToken}
          viewerUserId={viewerUserId}
        />
      </ReplyItem>
    );
  },
);

RootReplyItemMemo.displayName = 'RootReplyItemMemo';

interface Props {
  reviewId: string | string[];
  reviewUserId: number;
  isRefetch: boolean;
  setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  lastCreatedRootReplyId?: number | null;
}

export default function ReplyItemList({
  reviewId,
  reviewUserId,
  isRefetch,
  setIsRefetch,
  lastCreatedRootReplyId,
}: Props) {
  const { user } = useAuthSession();
  const viewerUserId = user?.userId ?? null;
  const [openReplyIds, setOpenReplyIds] = useState<Set<number>>(new Set());
  const [subReplyRefreshToken, setSubReplyRefreshToken] = useState(0);
  const {
    data: rootReplyPages,
    isLoading: isRootFirstLoading,
    isFetching: isRootFetching,
    targetRef: rootReplyTargetRef,
    hasNextPage: hasNextRootReplyPage,
    refetch: refetchRootReply,
  } = usePaginatedQuery<{ reviewReplies: RootReply[] }>({
    queryKey: ['review-reply', viewerUserId, reviewId],
    queryFn: ({ pageParam }) =>
      ReplyApi.getRootReplyList({
        reviewId: String(reviewId),
        cursor: pageParam,
        size: 10,
      }),
  });
  const rootReplies =
    rootReplyPages?.flatMap((page) => page.data.reviewReplies) ?? [];

  const handleToggleSubReply = useCallback((rootReplyId: number) => {
    setOpenReplyIds((previous) => {
      const next = new Set(previous);
      if (next.has(rootReplyId)) next.delete(rootReplyId);
      else next.add(rootReplyId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isRefetch) return;

    if (lastCreatedRootReplyId) {
      setOpenReplyIds((previous) =>
        new Set(previous).add(lastCreatedRootReplyId),
      );
    }
    setSubReplyRefreshToken((previous) => previous + 1);
    refetchRootReply();
    setIsRefetch(false);
  }, [isRefetch, lastCreatedRootReplyId, refetchRootReply, setIsRefetch]);

  if (!isRootFirstLoading && rootReplies.length === 0) {
    return (
      <>
        <div className="h-4 bg-bg-layer-basement" />
        <section className="py-5 mb-20">
          <EmptyView text="아직 댓글이 없어요!" />
        </section>
      </>
    );
  }

  return (
    <>
      <div className="h-4 bg-bg-layer-basement" />
      <List
        isListFirstLoading={isRootFirstLoading}
        isScrollLoading={isRootFetching}
      >
        <List.Section>
          <section className="mx-5 py-5 space-y-3 pb-40">
            {rootReplies.map((comment, index) => (
              <React.Fragment key={`root-${comment.reviewReplyId}`}>
                <RootReplyItemMemo
                  comment={comment}
                  reviewUserId={reviewUserId}
                  reviewId={reviewId}
                  setIsRefetch={setIsRefetch}
                  isSubReplyShow={openReplyIds.has(comment.reviewReplyId)}
                  onToggleSubReply={handleToggleSubReply}
                  subReplyRefreshToken={subReplyRefreshToken}
                  viewerUserId={viewerUserId}
                />
                {index !== rootReplies.length - 1 && (
                  <div className="border-b border-stroke-neutral-subtle" />
                )}
              </React.Fragment>
            ))}
          </section>
        </List.Section>
      </List>
      {hasNextRootReplyPage && <div ref={rootReplyTargetRef} />}
    </>
  );
}
