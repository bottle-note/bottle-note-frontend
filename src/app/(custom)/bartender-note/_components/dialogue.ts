import type { Step } from './types';
import type { Curation, Whiskey } from '../_data/demo';

/** 바텐더가 방금 일어난 일을 알리는 대사. 다른 단계로 넘어가면 사라진다. */
export type Notice =
  | 'pick-added'
  | 'pick-removed'
  | 'pick-failed'
  | 'review-failed'
  | 'rating-failed';

export type DialogueInput = {
  step: Step;
  /** 상세 직전 단계. 추천 이유와 큐레이션 설명 중 무엇을 말할지 정한다. */
  detailOrigin?: Step;
  selected?: Whiskey;
  curation?: Curation;
  /** 추천 목록에서 고른 술의 추천 이유 */
  recommendationReason?: string;
  notice?: Notice | null;
  exactCount: number;
  similarCount: number;
  level: string;
  kind: string;
  likedCount: number;
  /** 마셔본 술 중 고른 종류에 맞는 술 이름 */
  baseWhiskeyName?: string;
};

const notices: Record<Notice, string> = {
  'pick-added': '찜해 두었습니다. 처음 화면에서 다시 볼 수 있어요.',
  'pick-removed': '찜에서 뺐습니다.',
  'pick-failed': '찜을 바꾸지 못했어요.\n잠시 후 다시 눌러 주세요.',
  'review-failed': '리뷰를 올리지 못했어요.\n잠시 후 다시 눌러 주세요.',
  'rating-failed':
    '리뷰는 올렸는데 별점은 저장하지 못했어요.\n술 상세 페이지에서 별점을 다시 남겨 주세요.',
};

function detailReason({
  detailOrigin,
  selected,
  curation,
  recommendationReason,
}: DialogueInput) {
  if (!selected) return undefined;
  if (detailOrigin === 'curation-list')
    return `「${curation?.title}」에 담긴 병이에요.\n${selected.tags.slice(0, 2).join('·')} 향이 중심입니다.`;
  if (detailOrigin === 'recommendations' || detailOrigin === 'similar')
    return recommendationReason;
  return undefined;
}

function axisLine({ baseWhiskeyName, likedCount, kind }: DialogueInput) {
  if (baseWhiskeyName)
    return `「${baseWhiskeyName}」을 기준으로 잡을게요.\n오늘은 어떤 결로 가실까요?`;
  if (likedCount > 0 && kind !== '상관없어요')
    return `${kind} 중에선 어떤 결로 드릴까요?\n한 가지만 잡으면 나머지는 제가 맞춰 드립니다.`;
  return '오늘은 어떤 결로 가실까요?\n한 가지만 잡으면 나머지는 제가 맞춰 드립니다.';
}

export function getDialogue(input: DialogueInput): string[] {
  const { step, exactCount, similarCount, curation, selected, level } = input;
  if (input.notice) return [notices[input.notice]];
  const reason = detailReason(input);
  const dialogue: Record<Step, string[]> = {
    intro: [
      '어서 오십시오. 편한 자리에 앉으시면 됩니다.\n오늘은 어떻게 도와드릴까요?',
    ],
    level: ['알겠습니다.\n위스키는 얼마나 드셔보셨어요?'],
    likes: [
      level === '위스키 잘 몰라요'
        ? '드셔본 게 없으시면 그냥 넘어가셔도 됩니다.\n혹시 이름만 들어본 술이라도 있으신가요?'
        : '그중에 괜찮았던 게 있나요?\n이름을 적으시면 그 결에 가까운 쪽으로 찾아드려요.',
    ],
    kind: [
      '종류는 어떤 쪽이 좋으세요?\n잘 모르시면 상관없어요로 두셔도 됩니다.',
    ],
    axis: [axisLine(input)],
    abv: [
      '도수는 어느 정도가 좋으신가요?\n높을수록 향은 진하지만 부담도 큽니다.',
    ],
    price: [
      '예산은 어느 정도로 보세요?\n한 잔 값은 바마다 달라서 대략으로 말씀드릴게요.',
    ],
    recommendations: [
      exactCount
        ? `조건에 맞는 병 ${exactCount}병을 골랐습니다.\n마음에 드는 위스키가 있나요?`
        : similarCount
          ? '조건에 딱 맞는 병은 없네요.\n대신 가장 가까운 병을 골랐습니다.'
          : '말씀하신 예산에서 병을 찾지 못했어요.\n조건을 바꿔 다시 골라 볼까요?',
    ],
    similar: [
      '조건에서 조금 벗어나지만 가까운 병들입니다.\n한 병씩 살펴보세요.',
    ],
    situation: ['어떤 자리인가요?\n자리에 맞는 큐레이션으로 안내해 드릴게요.'],
    curations: ['이런 큐레이션이 있어요.\n어느 쪽이 끌리세요?'],
    'curation-empty': [
      '이 자리의 큐레이션은 지금 준비 중이에요.\n대신 취향을 여쭤보고 골라 드릴까요?',
    ],
    'curation-list': [
      curation?.description ?? '큐레이션에 담긴 순서대로 보여 드릴게요.',
    ],
    favorites: ['찜해 둔 술입니다.\n오늘은 어느 쪽으로 드릴까요?'],
    detail: [
      selected
        ? reason ??
          `${selected.name}, 좋은 선택입니다.\n향과 정보를 살펴보세요.`
        : '한 병 골라 보세요.',
    ],
    'review-pick': [
      '무엇을 드시고 계신가요?\n이름을 적으시거나 아래에서 고르시면 됩니다.',
    ],
    'review-mode': [
      '리뷰는 어떻게 남겨 보실래요?\n편한 방식으로 적으시면 됩니다.',
    ],
    'review-text': ['어떠세요?\n키워드를 골라도 되고, 직접 쓰셔도 됩니다.'],
    'review-nose': ['먼저 향부터요.\n잔에 코를 대면 뭐가 올라오나요?'],
    'review-palate': ['한 모금 머금으면요?\n단맛, 질감, 스파이스 같은 것들요.'],
    'review-finish': ['삼키고 나서는요?\n여운이 얼마나, 뭐가 남는지요.'],
    'review-graph': [
      '풍미를 그래프로도 남겨 볼까요?\n느낀 만큼 조절하거나 건너뛰셔도 돼요.',
    ],
    'review-photo': ['사진이 있나요?\n잔이나 병, 라벨 사진이면 좋아요.'],
    'review-rating': [
      '오늘의 한 잔은 몇 점인가요?\n반 점 단위로 고를 수 있어요.',
    ],
    'review-where': ['어디에서 드셨나요?\n장소와 가격은 건너뛰셔도 됩니다.'],
    'review-preview': ['다 적었습니다.\n이렇게 올리면 될까요?'],
    'review-done': [
      '올렸습니다. 좋은 기록이 하나 늘었네요.\n한 잔 더 기록하시겠어요?',
    ],
  };
  return dialogue[step];
}
