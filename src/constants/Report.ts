// comment API 나오면 맞춰서 수정 예정
export const REPORT_TYPE = {
  review: {
    title: '리뷰 신고',
    options: [
      {
        type: 'ADVERTISEMENT',
        name: '광고 신고',
      },
      {
        type: 'PROFANITY',
        name: '욕설 신고',
      },
    ],
  },
  comment: {
    title: '댓글 신고',
    options: [
      {
        type: 'SPAM',
        name: '스팸 신고',
      },
      {
        type: 'INAPPROPRIATE_CONTENT',
        name: '부적절한 콘텐츠 신고',
      },
      {
        type: 'FRAUD',
        name: '사기 신고',
      },
      {
        type: 'COPYRIGHT_INFRINGEMENT',
        name: '저작권 침해 신고',
      },
      {
        type: 'OTHER',
        name: '그 외 기타 신고',
      },
    ],
  },
  user: {
    title: '유저 신고',
    options: [
      {
        type: 'SPAM',
        name: '스팸 신고',
      },
      {
        type: 'INAPPROPRIATE_CONTENT',
        name: '부적절한 콘텐츠 신고',
      },
      {
        type: 'FRAUD',
        name: '사기 신고',
      },
      {
        type: 'COPYRIGHT_INFRINGEMENT',
        name: '저작권 침해 신고',
      },
      {
        type: 'OTHER',
        name: '그 외 기타 신고',
      },
    ],
  },
};
