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
  selected?: Pick<Whiskey, 'name' | 'tags'>;
  curation?: Curation;
  notice?: Notice | null;
  /** 좁혀진 후보 수는 대사에도 쓰지 않는다. 있는지 여부만 받는다. */
  hasCandidates: boolean;
  /** 추천 결과 1위의 이름. 첫 잔을 건넬 때 부른다. */
  firstPickName?: string;
  /** 불러온 찜 수. 아직 불러오는 중이면 비워 둔다. */
  pickCount?: number;
};

const notices: Record<Notice, string> = {
  'pick-added': '찜해 두었습니다. 처음 화면에서 다시 볼 수 있어요.',
  'pick-removed': '찜에서 뺐습니다.',
  'pick-failed': '찜을 바꾸지 못했어요.\n잠시 후 다시 눌러 주세요.',
  'review-failed': '리뷰를 올리지 못했어요.\n잠시 후 다시 눌러 주세요.',
  'rating-failed':
    '리뷰는 올렸는데 별점은 저장하지 못했어요.\n술 상세 페이지에서 별점을 다시 남겨 주세요.',
};

function detailReason({ detailOrigin, selected, curation }: DialogueInput) {
  if (!selected) return undefined;
  if (detailOrigin === 'curation-list')
    return `「${curation?.title}」에 담긴 병이에요.\n${selected.tags.slice(0, 2).join('·')} 향이 중심입니다.`;
  if (detailOrigin === 'favorites')
    return '찜해 두신 병이네요.\n오늘은 이걸로 드릴까요?';
  return undefined;
}

/** 추천 결과 1위를 건네는 인사. */
export function firstPickGreeting(name?: string) {
  return name
    ? `먼저 이 한 잔부터 드려 볼게요.\n${name}입니다.`
    : '먼저 이 한 잔부터 드려 볼게요.';
}

export function getDialogue(input: DialogueInput): string[] {
  const { step, hasCandidates, firstPickName, pickCount, curation, selected } =
    input;
  if (input.notice) return [notices[input.notice]];
  const reason = detailReason(input);
  const dialogue: Record<Step, string[]> = {
    intro: [
      '어서 오십시오. 편한 자리에 앉으시면 됩니다.\n오늘은 어떻게 도와드릴까요?',
    ],
    scenario: ['질문을 준비하고 있어요.'],
    'first-pick': [firstPickGreeting(firstPickName)],
    recommendations: [
      hasCandidates
        ? '다른 후보도 함께 보여 드릴게요.\n마음에 드는 위스키가 있나요?'
        : '추천 후보가 없어요.\n이전 질문으로 돌아가 다시 골라 볼까요?',
    ],
    situation: ['어떤 자리인가요?\n자리에 맞는 큐레이션으로 안내해 드릴게요.'],
    curations: ['이런 큐레이션이 있어요.\n어느 쪽이 끌리세요?'],
    'curation-empty': [
      '이 자리의 큐레이션은 지금 준비 중이에요.\n대신 취향을 여쭤보고 골라 드릴까요?',
    ],
    'curation-list': [
      curation?.description ?? '큐레이션에 담긴 순서대로 보여 드릴게요.',
    ],
    favorites: [
      pickCount === 0
        ? '아직 찜해 둔 술이 없네요.\n취향에 맞는 술부터 찾아볼까요?'
        : '찜해 둔 술입니다.\n오늘은 어느 쪽으로 드릴까요?',
    ],
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

/** 술 이야기 화면에 들어온 곳. 화면은 같고 말만 달라진다. */
export type TalkOrigin =
  | 'first-pick'
  | 'recommendations'
  | 'favorites'
  | 'curation-list'
  | 'other';

/** 술 이야기 화면의 첫 말풍선, 카드 이름표, 들어온 목록으로 돌아가는 대답. */
export function getTalkCopy(
  origin: TalkOrigin,
  curationTitle?: string,
): { opening: string; label: string; more?: string } {
  switch (origin) {
    case 'first-pick':
      return {
        opening: '오늘의 첫 잔이에요.',
        label: '오늘의 첫 잔',
        more: '다른 술도 보여주세요',
      };
    case 'recommendations':
      return {
        opening: '이 병도 잘 맞으실 거예요.',
        label: '추천 후보',
        more: '다른 술도 볼게요',
      };
    case 'favorites':
      return {
        opening: '찜해 두신 병이에요.',
        label: '내가 찜한 술',
        more: '다른 찜도 볼게요',
      };
    case 'curation-list':
      return {
        opening: curationTitle
          ? `「${curationTitle}」에 담긴 병이에요.`
          : '큐레이션에 담긴 병이에요.',
        label: curationTitle ?? '큐레이션',
        more: '이 큐레이션 더 볼게요',
      };
    default:
      return { opening: '좋은 선택이에요.', label: '고른 술' };
  }
}

/** 술 이야기의 진행. 들을지 묻고, 문장씩 들려주고, 맺는다. */
export type StoryPhase = 'offer' | 'telling' | 'told' | 'declined' | 'settled';

const STORY_COPY = {
  offer: [
    '이 병엔 얽힌 이야기가 좀 있어요. 들어 보시겠어요?',
    '잔 채우는 동안 이 술 얘기 하나 해 드릴까요?',
    '이 친구, 사연이 꽤 재밌거든요. 잠깐 들어 보실래요?',
  ],
  telling: ['음, 어디서부터 말씀드릴까요…', '잠깐만요, 이 병 얘기라면…'],
  closing: [
    '제 얘기는 여기까지예요.\n나머지는 한 모금이 알려 줄 거예요.',
    '이야기는 이쯤 하고요.\n직접 맛보시는 게 제일 정확하죠.',
  ],
  more: '더 긴 이야기는 전체 글에 적어 뒀어요.\n천천히 읽어 보세요.',
  declined: '알겠습니다. 편하게 둘러보세요.',
};

/** 같은 술에는 늘 같은 말을 하도록 술 id로 고른다. */
const byId = (lines: string[], id: number) => lines[id % lines.length];

/** 들려줄 이야기가 없을 때 다른 술로 이끄는 말풍선. */
export const STORY_NONE = '다른 병도 궁금하시면 말씀하세요.';

/** 이야기를 듣지 않았거나 다시 들어왔을 때 다시 권하는 말풍선. */
export const storyLater = (heard: boolean) =>
  heard
    ? '이야기를 다시 들려 드릴까요?'
    : '이 술 이야기가 궁금해지면 언제든 말씀하세요.';

/** 카드 아래에서 이야기를 들을지 묻는 말풍선. */
export const storyOffer = (alcoholId: number) =>
  byId(STORY_COPY.offer, alcoholId);

/**
 * 술 이야기 화면의 대사창. 설명 원문은 카드 아래 말풍선으로 들려주고,
 * 대사창은 받는 말과 맺는 말만 한다. 문단이 더 있으면 전체 글로 안내한다.
 */
export function getStoryDialogue({
  phase,
  alcoholId,
  greeting,
  paragraphs,
}: {
  phase: StoryPhase;
  alcoholId: number;
  greeting: string;
  paragraphs: string[];
}): string[] {
  switch (phase) {
    case 'telling':
      return [byId(STORY_COPY.telling, alcoholId)];
    case 'told':
      return [
        paragraphs.length > 1
          ? STORY_COPY.more
          : byId(STORY_COPY.closing, alcoholId),
      ];
    case 'declined':
      return [STORY_COPY.declined];
    default:
      return [greeting];
  }
}
