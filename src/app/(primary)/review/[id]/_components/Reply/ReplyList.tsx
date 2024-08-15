import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RootReply, SubReplyListApi } from '@/types/Reply';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { ReplyApi } from '@/app/api/ReplyApi';
import List from '@/components/List/List';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import Reply from './Reply';

interface Props {
  reviewId: string | string[];
  isRefetch: boolean;
  setIsRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ReplyList({
  reviewId,
  isRefetch,
  setIsRefetch,
}: Props) {
  const { data: session } = useSession();
  const [subReplyList, setSubReplyList] = useState<SubReplyListApi>();

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

  const getSubReplyList = async (rootReplyId: number) => {
    const result = await ReplyApi.getSubReplyList({
      reviewId: reviewId.toString(),
      rootReplyId: rootReplyId.toString(),
    });

    setSubReplyList(result);
  };

  useEffect(() => {
    if (isRefetch) {
      // 다음 pr에서 대댓글 수정하며 같이 리팩토링 예정
      refetchRootReply().then(() => setSubReplyList(undefined));
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
