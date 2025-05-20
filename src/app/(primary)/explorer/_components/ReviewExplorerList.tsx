import ReviewCard from './ReviewCard';

const sampleReviews = [
  {
    user: {
      avatarUrl: '',
      nickname: '닉네임노출영역',
    },
    whiskeyName: '글렌드로낙 오리지널 12Y',
    rating: 3.5,
    imageUrl: '',
    reviewText:
      '한 모금만으로도 느껴지는 부드러운 바닐라와 캐러멜 향. 마무리는 은은한 스파이스가 입안을 감돕니다. 옛 방식을 고수한 수공예 방식이 고급스러운 깊이를 더하며, 붉은 왁스 씰까지 브랜드의 개성을 완성합니다. 부담 없이 마시기 좋으면서도 충분히 인상적인, 위스키 입문자와 애호가 모두를 만족시킬 클래식한 선택입니다.',
    flavorTags: [
      '건자두',
      '생강',
      '스파이시',
      '달콤한',
      '과일',
      '오크',
      '토피',
      '바닐라',
      '건포도',
      '캐러멜',
      '사과',
    ],
    likes: 43,
    comments: 3,
    date: '2024. 04. 01',
    isBest: true,
    isMyComment: false,
  },
  {
    user: {
      avatarUrl: '',
      nickname: '위스키사랑',
    },
    whiskeyName: '메이커스 마크 46',
    rating: 4.2,
    imageUrl: '',
    reviewText:
      '짙은 캐러멜과 바닐라, 그리고 은은한 스파이스의 조화가 일품입니다. 프렌치 오크통에서 추가 숙성되어 더욱 풍부하고 부드러운 맛을 자랑합니다. 병 디자인도 아름다워 선물용으로도 좋습니다.',
    flavorTags: ['캐러멜', '바닐라', '스파이시', '오크', '부드러움'],
    likes: 77,
    comments: 12,
    date: '2024. 04.05',
    isBest: false,
    isMyComment: true,
  },
];

export const ReviewExplorerList = () => {
  return (
    <div className="space-y-5">
      {sampleReviews.map((review, index) => (
        <ReviewCard key={index} {...review} />
      ))}
    </div>
  );
};
