import { SubReply } from '@/types/Reply';

export function sortReplies(replies: SubReply[], rootReplyId: number) {
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
}
