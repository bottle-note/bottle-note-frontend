import React, { useEffect, useState, useCallback } from 'react';
import { RootReply, SubReply } from '@/types/Reply';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ReplyApi } from '@/app/api/ReplyApi';
import List from '@/components/feature/List/List';
import EmptyView from '@/components/ui/Display/EmptyView';
import ReplyItem from './ReplyItem';

interface Props {
  reviewId: string | string[];
  reviewUserId: number;
  isRefetch: boolean;
  setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  lastCreatedParentReplyId?: number | null;
}

export default function ReplyItemList({
  reviewId,
  reviewUserId,
  isRefetch,
  setIsRefetch,
  lastCreatedParentReplyId,
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

  const sortReplies = (replies: SubReply[], rootReplyId: number) => {
    const replyMap = new Map();

    replies.sort(
      (a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
    );

    replies.forEach((reply) => {
      const { parentReviewReplyId } = reply;
      if (!replyMap.has(parentReviewReplyId)) {
        replyMap.set(parentReviewReplyId, []);
      }
      replyMap.get(parentReviewReplyId).push(reply);
    });

    const sortedReplies: SubReply[] = [];
    const sortAndPush = (parentId: number) => {
      if (replyMap.has(parentId)) {
        replyMap.get(parentId).forEach((reply: SubReply) => {
          sortedReplies.push(reply);
          sortAndPush(reply.reviewReplyId);
        });
      }
    };

    sortAndPush(rootReplyId);

    return sortedReplies;
  };

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

  const handleToggleSubReply = (rootReplyId: number) => {
    setOpenReplyIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rootReplyId)) {
        newSet.delete(rootReplyId);
      } else {
        newSet.add(rootReplyId);
        // Map에 해당 rootReplyId의 대댓글이 없으면 fetch
        if (!subReplyMap.has(rootReplyId)) {
          getSubReplyList(rootReplyId);
        }
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (isRefetch) {
      setOpenReplyIds((currentOpenIds) => {
        const previousOpenIds = new Set(currentOpenIds);

        refetchRootReply().then(() => {
          // 대댓글을 등록한 경우, 해당 루트 댓글의 대댓글 목록만 다시 fetch
          if (lastCreatedParentReplyId) {
            setOpenReplyIds((prev) =>
              new Set(prev).add(lastCreatedParentReplyId),
            );
            setSubReplyMap((prev) => {
              const newMap = new Map(prev);
              newMap.delete(lastCreatedParentReplyId);
              return newMap;
            });
            getSubReplyList(lastCreatedParentReplyId);
          } else {
            // 루트 댓글을 등록한 경우, 기존에 열려있던 대댓글 목록들을 다시 fetch
            setSubReplyMap(new Map());
            previousOpenIds.forEach((id) => {
              getSubReplyList(id);
            });
          }
        });

        return currentOpenIds;
      });
      setIsRefetch(false);
    }
  }, [
    isRefetch,
    refetchRootReply,
    setIsRefetch,
    lastCreatedParentReplyId,
    getSubReplyList,
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
                {firstPage.reviewReplies.map((comment, index) => {
                  const subReplies = subReplyMap.get(comment.reviewReplyId);

                  return (
                    <React.Fragment key={`root-${comment.reviewReplyId}`}>
                      <ReplyItem
                        data={comment}
                        isReviewUser={reviewUserId === comment.userId}
                        reviewId={reviewId}
                        setIsRefetch={setIsRefetch}
                        isSubReplyShow={openReplyIds.has(comment.reviewReplyId)}
                        onToggleSubReply={() =>
                          handleToggleSubReply(comment.reviewReplyId)
                        }
                      >
                        {openReplyIds.has(comment.reviewReplyId) &&
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
                                  isReviewUser={
                                    reviewUserId === subComment.userId
                                  }
                                  reviewId={reviewId}
                                  setIsRefetch={setIsRefetch}
                                />
                              </div>
                            </div>
                          ))}
                      </ReplyItem>
                      {index !== firstPage.totalCount - 1 && (
                        <div className="border-b border-mainGray/30" />
                      )}
                    </React.Fragment>
                  );
                })}
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
