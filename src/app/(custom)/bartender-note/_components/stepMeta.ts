import type { Pose } from './BarScene';
import type { ReviewDraft, Step } from './types';

type StepMeta = {
  title: string;
  subtitle?: string;
  pose: Pose;
  /** 질문·리뷰 순서와 관계없이 고정된 진행률 */
  progress?: number;
};

const NOTE = '바텐더 노트';
const PICKS = '바텐더 추천';
const SITUATION = '상황별 추천';
const REVIEW = '리뷰 쓰기';

const STEP_META: Record<Step, StepMeta> = {
  intro: { title: NOTE, pose: 'greet' },
  scenario: { title: NOTE, pose: 'idle' },
  recommendations: { title: PICKS, pose: 'think', progress: 100 },
  situation: { title: SITUATION, pose: 'think' },
  curations: { title: SITUATION, subtitle: '상황별 큐레이션', pose: 'idle' },
  'curation-empty': { title: SITUATION, pose: 'bow' },
  'curation-list': { title: PICKS, pose: 'idle', progress: 100 },
  favorites: { title: '찜한 술', pose: 'idle' },
  detail: { title: '오늘의 한 잔', pose: 'serve' },
  'review-pick': { title: REVIEW, subtitle: '어떤 술인가요', pose: 'idle' },
  'review-mode': { title: REVIEW, subtitle: '어떻게 남길까요', pose: 'serve' },
  'review-text': { title: REVIEW, subtitle: '코멘트', pose: 'idle' },
  'review-nose': { title: REVIEW, subtitle: '노즈 1 / 3', pose: 'nose' },
  'review-palate': { title: REVIEW, subtitle: '팔레트 2 / 3', pose: 'idle' },
  'review-finish': { title: REVIEW, subtitle: '피니시 3 / 3', pose: 'idle' },
  'review-graph': { title: REVIEW, subtitle: '테이스팅 노트', pose: 'idle' },
  'review-photo': { title: REVIEW, subtitle: '사진', pose: 'idle' },
  'review-rating': { title: REVIEW, subtitle: '별점', pose: 'idle' },
  'review-where': { title: REVIEW, subtitle: '장소', pose: 'idle' },
  'review-preview': { title: REVIEW, subtitle: '다 됐습니다', pose: 'idle' },
  'review-done': {
    title: REVIEW,
    subtitle: '등록 완료',
    pose: 'toast',
    progress: 100,
  },
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
    curationTitle,
    reviewMode,
    questionNumber,
  }: {
    curationTitle?: string;
    reviewMode: ReviewDraft['mode'];
    questionNumber?: number;
  },
) {
  const meta = STEP_META[step];
  const reviewSteps = reviewProgressSteps(reviewMode);
  const review = reviewSteps.indexOf(step);
  const subtitle =
    step === 'scenario'
      ? `질문 ${questionNumber}`
      : step === 'curation-list'
        ? curationTitle ?? ''
        : meta.subtitle ?? '';
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
