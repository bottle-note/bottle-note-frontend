import type { Step } from './types';
import type { Curation, Whiskey } from '../_data/demo';

export function getDialogue(
  step: Step,
  exactCount: number,
  curation?: Curation,
  selected?: Whiskey,
  recommendationReason?: string,
  similarCount = 0,
) {
  const dialogue: Record<Step, string[]> = {
    intro: [
      '어서 오십시오. 편한 자리에 앉으시면 됩니다.\n오늘은 어떻게 도와드릴까요?',
    ],
    level: ['알겠습니다.\n위스키는 얼마나 드셔보셨어요?'],
    likes: [
      '드셔본 술이 있으면 알려 주세요.\n최대 세 병까지 고르거나 건너뛰셔도 됩니다.',
    ],
    kind: [
      '종류는 어떤 쪽이 좋으세요?\n잘 모르시면 상관없어요로 두셔도 됩니다.',
    ],
    axis: [
      '오늘은 어떤 결로 가실까요?\n한 가지만 잡으면 나머지는 제가 맞춰 드립니다.',
    ],
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
        ? recommendationReason ??
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
    'review-posted-detail': [
      '방금 남긴 기록입니다.\n오늘의 한 잔을 다시 살펴보세요.',
    ],
  };
  return dialogue[step];
}
