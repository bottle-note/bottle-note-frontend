import type { Pose } from './BarScene';
import type { ReviewDraft, Step } from './types';

type StepMeta = {
  title: string;
  pose: Pose;
  /** 질문·리뷰 순서와 관계없이 고정된 진행률 */
  progress?: number;
};

const NOTE = '바텐더 노트';
const PICKS = '바텐더 추천';
const REVIEW = '리뷰 쓰기';
const CURATION = '보틀노트 큐레이션';

const STEP_META: Record<Step, StepMeta> = {
  intro: { title: NOTE, pose: 'greet' },
  scenario: { title: NOTE, pose: 'idle' },
  'first-pick': { title: PICKS, pose: 'serve', progress: 100 },
  recommendations: { title: PICKS, pose: 'think', progress: 100 },
  similar: { title: PICKS, pose: 'serve', progress: 100 },
  curations: { title: CURATION, pose: 'idle' },
  'curation-list': { title: CURATION, pose: 'idle', progress: 100 },
  favorites: { title: '찜한 술', pose: 'idle' },
  detail: { title: '오늘의 한 잔', pose: 'serve' },
  // 리뷰 단계는 대사와 진행률이 지금 할 일을 알려 주므로 서브타이틀을 두지 않는다
  'review-pick': { title: REVIEW, pose: 'idle' },
  'review-mode': { title: REVIEW, pose: 'serve' },
  'review-text': { title: REVIEW, pose: 'idle' },
  'review-nose': { title: REVIEW, pose: 'nose' },
  'review-palate': { title: REVIEW, pose: 'idle' },
  'review-finish': { title: REVIEW, pose: 'idle' },
  'review-graph': { title: REVIEW, pose: 'idle' },
  'review-photo': { title: REVIEW, pose: 'idle' },
  'review-rating': { title: REVIEW, pose: 'idle' },
  'review-where': { title: REVIEW, pose: 'idle' },
  'review-place': { title: REVIEW, pose: 'idle' },
  'review-preview': { title: REVIEW, pose: 'idle' },
  'review-done': { title: REVIEW, pose: 'toast', progress: 100 },
};

function reviewProgressSteps(mode: ReviewDraft['mode']): Step[] {
  return [
    'review-mode',
    ...(mode === 'quick'
      ? (['review-text'] as Step[])
      : (['review-nose', 'review-palate', 'review-finish'] as Step[])),
    'review-graph',
    'review-photo',
    'review-rating',
    'review-where',
    'review-preview',
    'review-done',
  ];
}

export function getStepHeader(
  step: Step,
  {
    reviewMode,
    questionNumber,
  }: {
    reviewMode: ReviewDraft['mode'];
    questionNumber?: number;
  },
) {
  const meta = STEP_META[step];
  const reviewSteps = reviewProgressSteps(reviewMode);
  // 장소 찾기는 장소·가격 단계 안에서 잠깐 여는 화면이라 같은 진행률을 쓴다
  const review = reviewSteps.indexOf(
    step === 'review-place' ? 'review-where' : step,
  );
  const subtitle = step === 'scenario' ? `질문 ${questionNumber}` : '';
  const progress =
    step === 'scenario'
      ? undefined
      : meta.progress ??
        (review >= 0 ? ((review + 1) / reviewSteps.length) * 100 : 0);
  return { title: meta.title, subtitle, progress };
}

export function getStepPose(step: Step) {
  return STEP_META[step].pose;
}
