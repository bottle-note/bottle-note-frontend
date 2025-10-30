import React, { useEffect, useState, useCallback, memo } from 'react';
import { RootReply, SubReply } from '@/types/Reply';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ReplyApi } from '@/app/api/ReplyApi';
import List from '@/components/feature/List/List';
import EmptyView from '@/components/ui/Display/EmptyView';
import { sortReplies } from '@/utils/sortReplies';
import ReplyItem from './ReplyItem';

const RootReplyItemMemo = memo(
  ({
    comment,
    reviewUserId,
    reviewId,
    setIsRefetch,
    isSubReplyShow,
    onToggleSubReply,
    subReplies,
  }: {
    comment: RootReply;
    reviewUserId: number;
    reviewId: string | string[];
    setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
    isSubReplyShow: boolean;
    onToggleSubReply: (id: number) => void;
    subReplies: SubReply[] | undefined;
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
        {isSubReplyShow &&
          subReplies &&
          subReplies.length > 0 &&
          subReplies.map((subComment) => (
            <div
              key={`sub-${subComment.reviewReplyId}`}
              className="relative ml-[6px]"
            >
              <div className="absolute top-0 w-px h-full bg-gray/30" />
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
  const [subReplyMap, setSubReplyMap] = useState<Map<number, SubReply[]>>(
    new Map(),
  );
  const [openReplyIds, setOpenReplyIds] = useState<Set<number>>(new Set());

  const {
    data: rootReplyList,
    isLoading: isRootFirstLoading,
    isFetching: isRootFetching,
    targetRef: rootReplyTargetRef,
    refetch: refetchRootReply,
  } = usePaginatedQuery<{ reviewReplies: RootReply[]; totalCount: number }>({
    queryKey: ['review_reply', reviewId],
    queryFn: ({ pageParam }) => {
      return ReplyApi.getRootReplyList({
        reviewId: reviewId as string,
        cursor: pageParam,
        pageSize: 10,
      });
    },
  });

  const getSubReplyList = useCallback(
    async (rootReplyId: number) => {
      const result = await ReplyApi.getSubReplyList({
        reviewId: reviewId.toString(),
        rootReplyId: rootReplyId.toString(),
      });

      if (result && result.totalCount > 0) {
        const replyFormattedList = sortReplies(
          result.reviewReplies,
          rootReplyId,
        );
        setSubReplyMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(rootReplyId, replyFormattedList);
          return newMap;
        });
      }
    },
    [reviewId],
  );

  const handleToggleSubReply = useCallback(
    (rootReplyId: number) => {
      setOpenReplyIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(rootReplyId)) {
          newSet.delete(rootReplyId);
        } else {
          newSet.add(rootReplyId);

          if (!subReplyMap.has(rootReplyId)) {
            getSubReplyList(rootReplyId);
          }
        }
        return newSet;
      });
    },
    [subReplyMap, getSubReplyList],
  );

  useEffect(() => {
    if (isRefetch) {
      const previousOpenIds = new Set(openReplyIds);

      // 항상 rootReply를 refetch하여 count 업데이트
      refetchRootReply().then(async () => {
        // 대댓글을 등록한 경우, 해당 루트 댓글의 대댓글 목록만 다시 fetch
        if (lastCreatedRootReplyId) {
          setOpenReplyIds((prev) => new Set(prev).add(lastCreatedRootReplyId));
          // 해당 대댓글을 다시 fetch (await로 완료될 때까지 대기)
          await getSubReplyList(lastCreatedRootReplyId);
        } else {
          // 루트 댓글을 등록한 경우, 기존에 열려있던 대댓글 목록들을 다시 fetch
          setSubReplyMap(new Map());
          previousOpenIds.forEach((id) => {
            getSubReplyList(id);
          });
        }
      });
      setIsRefetch(false);
    }
  }, [
    isRefetch,
    refetchRootReply,
    setIsRefetch,
    lastCreatedRootReplyId,
    getSubReplyList,
    openReplyIds,
  ]);

  const firstPage = rootReplyList?.[0]?.data;

  return (
    <>
      {firstPage && firstPage.totalCount > 0 ? (
        <>
          <div className="h-4 bg-sectionWhite" />
          <List
            isListFirstLoading={isRootFirstLoading}
            isScrollLoading={isRootFetching}
          >
            <List.Section>
              <section className="mx-5 py-5 space-y-3 pb-40">
                {firstPage.reviewReplies.map((comment, index) => (
                  <React.Fragment key={`root-${comment.reviewReplyId}`}>
                    <RootReplyItemMemo
                      comment={comment}
                      reviewUserId={reviewUserId}
                      reviewId={reviewId}
                      setIsRefetch={setIsRefetch}
                      isSubReplyShow={openReplyIds.has(comment.reviewReplyId)}
                      onToggleSubReply={handleToggleSubReply}
                      subReplies={subReplyMap.get(comment.reviewReplyId)}
                    />
                    {index !== firstPage.totalCount - 1 && (
                      <div className="border-b border-mainGray/30" />
                    )}
                  </React.Fragment>
                ))}
              </section>
            </List.Section>
          </List>
          <div ref={rootReplyTargetRef} />
        </>
      ) : (
        <>
          <div className="h-4 bg-sectionWhite" />
          <section className="py-5 mb-20">
            <EmptyView text="아직 댓글이 없어요!" />
          </section>
        </>
      )}
    </>
  );
}
