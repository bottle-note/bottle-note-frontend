import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RootReply, SubReplyListApi, SubReply } from '@/types/Reply';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ReplyApi } from '@/app/api/ReplyApi';
import List from '@/components/List/List';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import Reply from './Reply';

interface Props {
  reviewId: string | string[];
  isRefetch: boolean;
  setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isSubReplyShow: boolean;
  resetSubReplyToggle: (value?: boolean) => void;
}

export default function ReplyList({
  reviewId,
  isRefetch,
  setIsRefetch,
  isSubReplyShow,
  resetSubReplyToggle,
}: Props) {
  const { data: session } = useSession();
  const [subReplyList, setSubReplyList] = useState<SubReplyListApi | null>();

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

  const getSubReplyList = async (rootReplyId: number) => {
    const result = await ReplyApi.getSubReplyList({
      reviewId: reviewId.toString(),
      rootReplyId: rootReplyId.toString(),
    });

    if (result && result.totalCount > 0) {
      const replyFormattedList = sortReplies(result.reviewReplies, rootReplyId);
      setSubReplyList({ ...result, reviewReplies: replyFormattedList });
    }
  };

  useEffect(() => {
    if (isRefetch) {
      refetchRootReply().then(() => setSubReplyList(null));
      setIsRefetch(false);
    }
  }, [isRefetch]);

  return (
    <>
      {rootReplyList && rootReplyList[0].data.totalCount > 0 ? (
        <>
          <div className="h-4 bg-sectionWhite" />
          <List
            isListFirstLoading={isRootFirstLoading}
            isScrollLoading={isRootFetching}
          >
            <List.Section>
              <section className="mx-5 py-5 space-y-3 pb-40">
                {rootReplyList[0]?.data?.reviewReplies.map((comment, index) => (
                  <React.Fragment key={comment.userId + comment.reviewReplyId}>
                    <Reply
                      data={comment}
                      getSubReplyList={getSubReplyList}
                      isReviewUser={comment.userId === session?.user.userId}
                      reviewId={reviewId}
                      setIsRefetch={setIsRefetch}
                      isSubReplyShow={isSubReplyShow}
                      resetSubReplyToggle={resetSubReplyToggle}
                    >
                      {(subReplyList?.totalCount ?? 0) > 0 &&
                        subReplyList?.reviewReplies.map((subComment) => (
                          <React.Fragment
                            key={
                              comment.reviewReplyId + subComment.reviewReplyId
                            }
                          >
                            <div className="border-b border-mainCoral/30" />
                            <div className="ml-5">
                              <Reply
                                data={subComment}
                                isReviewUser={
                                  subComment.userId === session?.user.userId
                                }
                                reviewId={reviewId}
                                setIsRefetch={setIsRefetch}
                              />
                            </div>
                          </React.Fragment>
                        ))}
                    </Reply>
                    {index !==
                      Number(rootReplyList[0]?.data?.totalCount) - 1 && (
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
          <section className="py-5">
            <EmptyView text="아직 댓글이 없어요!" />
          </section>
        </>
      )}
    </>
  );
}
