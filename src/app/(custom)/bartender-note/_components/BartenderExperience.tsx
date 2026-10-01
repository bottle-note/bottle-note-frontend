'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Heart, X } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import SegmentedControl from '@/components/ui/Form/SegmentedControl';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import PromptModal from '@/components/ui/Modal/PromptModal';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import type { FormValues } from '@/types/Review';
import { ROUTES } from '@/constants/routes';
import BartenderScene, { type BartenderPose } from './BartenderScene';
import BartenderDialogue from './BartenderDialogue';
import ChoiceCard from './ChoiceCard';
import BottleCard, { BottleSummary } from './BottleCard';
import BottleSearch from './BottleSearch';
import ReviewSteps from './ReviewSteps';
import styles from '../bartender.module.css';
import {
  CURATIONS,
  QUESTIONS,
  SITUATIONS,
  emptyReview,
  findBottle,
  initialAnswers,
  screenCopy,
  type Answers,
  type Step,
} from '../_lib/experience';
import { loadPreviewRecommendations } from '../_data/preview';
import { useJourney } from '../_hooks/useJourney';

const PRICE_UNITS = [
  { value: 'GLASS', label: '바에서 한 잔' },
  { value: 'BOTTLE', label: '병으로 살 때' },
] as const;
const BUDGETS = {
  GLASS: [
    '1.5만 원 이하',
    '1.5~2.5만 원',
    '2.5~4만 원',
    '4만 원 이상',
    '상관없어요',
  ],
  BOTTLE: [
    '5만 원 이하',
    '5~10만 원',
    '10~20만 원',
    '20만 원 이상',
    '상관없어요',
  ],
};
const NEXT_QUESTION: Partial<Record<Step, Step>> = {
  experience: 'familiar',
  kind: 'flavor',
  flavor: 'strength',
  strength: 'budget',
};

export default function BartenderExperience() {
  const router = useRouter();
  const { screen, backward, go, back, home, finishReview } = useJourney();
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [ready, setReady] = useState(false);
  const [talking, setTalking] = useState(false);
  const [familiarQuery, setFamiliarQuery] = useState('');
  const [reviewQuery, setReviewQuery] = useState('');
  const [resultCount, setResultCount] = useState(5);
  const [picked, setPicked] = useState<number[]>([]);
  const [pickNotice, setPickNotice] = useState('');
  const [showExit, setShowExit] = useState(false);
  const [reviewBottleId, setReviewBottleId] = useState<number>();
  const [reviewSession, setReviewSession] = useState(0);
  const [lastPlace, setLastPlace] = useState('');
  const [completed, setCompleted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isKeyboardVisible = useKeyboardVisible();
  const form = useForm<FormValues>({ defaultValues: emptyReview() });
  const selectedBottle = findBottle(screen.bottleId);
  const reviewBottle = findBottle(reviewBottleId);
  const isReview =
    screen.step.startsWith('review-') && screen.step !== 'review-search';
  const copy = screenCopy(screen);
  const question = QUESTIONS[screen.step as keyof typeof QUESTIONS];
  const curation = CURATIONS.find((item) => item.id === screen.curationId);
  const recommendations = useQuery({
    queryKey: ['bartender-preview', screen.curationId ?? 'taste', answers],
    queryFn: ({ signal }) =>
      loadPreviewRecommendations(signal, screen.curationId),
    enabled: screen.step === 'results',
    staleTime: Infinity,
    retry: false,
  });
  const loading = screen.step === 'results' && recommendations.isPending;
  const requestFailed = screen.step === 'results' && recommendations.isError;
  const resultBottles = recommendations.data ?? [];
  const pose: BartenderPose = requestFailed
    ? 'sorry'
    : loading
      ? 'think'
      : screen.step === 'intro'
        ? 'welcome'
        : screen.step === 'bottle'
          ? 'serve'
          : screen.step === 'review-complete'
            ? 'toast'
            : pickNotice
              ? 'smile'
              : 'idle';

  useEffect(() => {
    setPickNotice('');
    headingRef.current?.focus({ preventScroll: true });
  }, [screen]);

  useEffect(() => {
    if (!pickNotice) return;
    const timeout = window.setTimeout(() => setPickNotice(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [pickNotice]);

  useEffect(() => {
    if (!form.formState.isDirty || completed) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Legacy WebViews require returnValue as well as preventDefault.
      Object.assign(event, { returnValue: '' });
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [form.formState.isDirty, completed]);

  const choose = (field: keyof Answers, value: string) => {
    setAnswers((current) => ({ ...current, [field]: value }));
    go({ step: NEXT_QUESTION[screen.step] ?? 'budget' });
  };
  const startReview = (id: number) => {
    const session = Date.now();
    form.reset(emptyReview(lastPlace));
    setCompleted(false);
    setReviewSession(session);
    setReviewBottleId(id);
    go({ step: 'review-rating', bottleId: id, reviewSession: session });
  };
  const moveReview = (step: Step) =>
    go({ step, bottleId: reviewBottleId, reviewSession });
  const requestExit = () => {
    if (screen.step === 'intro' && !form.formState.isDirty)
      router.replace(ROUTES.HOME);
    else setShowExit(true);
  };
  const recommendationSummary = [
    QUESTIONS.experience.options.find(
      (item) => item.value === answers.experience,
    )?.title,
    QUESTIONS.kind.options.find((item) => item.value === answers.kind)?.title,
    QUESTIONS.flavor.options.find((item) => item.value === answers.flavor)
      ?.title,
    answers.budget,
  ].filter(Boolean);

  return (
    <FormProvider {...form}>
      <div className={`dark ${styles.shell}`}>
        <header className={styles.header}>
          <SubHeader>
            <SubHeader.Left>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="이전 단계"
                onClick={screen.step === 'intro' ? requestExit : back}
              >
                <ChevronLeft size={22} />
              </button>
            </SubHeader.Left>
            <SubHeader.Center textColor="text-fg-neutral">
              바텐더 노트
            </SubHeader.Center>
            <SubHeader.Right>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="바텐더 노트 닫기"
                onClick={requestExit}
              >
                <X size={22} />
              </button>
            </SubHeader.Right>
          </SubHeader>
          <div
            className={styles.progress}
            role="progressbar"
            aria-label="대화 진행"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(copy.progress * 100)}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${copy.progress * 100}%` }}
            />
          </div>
        </header>
        <p className={styles.previewNotice}>
          화면 미리보기 · 추천은 예시이며 찜·리뷰는 저장되지 않아요.
        </p>
        <div className={styles.scene} data-compact={isKeyboardVisible}>
          <BartenderScene
            pose={pose}
            talking={talking}
            sceneKey={`${screen.step}:${screen.bottleId ?? ''}`}
            onReady={() => setReady(true)}
          />
          <BartenderDialogue
            key={`${screen.step}:${loading}:${requestFailed}:${screen.bottleId ?? ''}`}
            ready={ready}
            pages={
              loading
                ? [
                    '취향에 어울리는 한 잔을 찾고 있어요.\n잠시만 기다려 주세요.',
                  ]
                : requestFailed
                  ? [
                      '잠시 한 잔을 고르지 못했네요.\n한 번 더 부탁해 주시겠어요?',
                    ]
                  : copy.pages
            }
            onTalkingChange={setTalking}
          />
        </div>
        <section className={styles.content} aria-label="바텐더와 대화">
          <p className={styles.eyebrow}>
            {isReview
              ? '한 잔의 기록'
              : screen.step === 'intro'
                ? '노트의 바에 오신 걸 환영해요'
                : screen.situation || screen.curationId
                  ? '상황에 맞는 한 잔'
                  : '오늘의 위스키 이야기'}
          </p>
          <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
            {copy.title}
          </h1>
          <div
            key={isReview ? 'review' : screen.step}
            className={styles.step}
            data-backward={backward}
          >
            {screen.step === 'intro' && (
              <div className={styles.stack}>
                <ChoiceCard
                  title="제 취향에 맞는 술을 추천받을게요"
                  description="몇 가지 이야기를 나누며 골라 봐요"
                  onClick={() => go({ step: 'experience' })}
                />
                <ChoiceCard
                  title="상황에 맞게 추천해 주세요"
                  description="집 · 바 · 계절 · 선물을 위한 큐레이션"
                  onClick={() => go({ step: 'situation' })}
                />
                <ChoiceCard
                  title="바텐더님과 함께 리뷰를 쓸게요"
                  description="지금 즐기는 한 잔을 차근차근 기록해요"
                  onClick={() => go({ step: 'review-search' })}
                />
              </div>
            )}

            {question && (
              <div className={styles.stack}>
                {question.options.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    description={option.description}
                    selected={
                      answers[screen.step as keyof Answers] === option.value
                    }
                    onClick={() =>
                      choose(screen.step as keyof Answers, option.value)
                    }
                  />
                ))}
              </div>
            )}

            {screen.step === 'familiar' && (
              <>
                <BottleSearch
                  query={familiarQuery}
                  onQueryChange={setFamiliarQuery}
                  selected={answers.familiar}
                  onSelect={(id) =>
                    setAnswers((current) => ({
                      ...current,
                      familiar: current.familiar.includes(id)
                        ? current.familiar.filter((value) => value !== id)
                        : current.familiar.length < 3
                          ? [...current.familiar, id]
                          : current.familiar,
                    }))
                  }
                />
                <div className={styles.actions}>
                  <Button onClick={() => go({ step: 'kind' })}>
                    {answers.familiar.length
                      ? '이 술들로 찾아주세요'
                      : '아직 없어요 · 넘어갈게요'}
                  </Button>
                </div>
              </>
            )}

            {screen.step === 'budget' && (
              <div className={styles.stack}>
                <SegmentedControl
                  label="추천 가격 기준"
                  value={answers.unit}
                  options={PRICE_UNITS}
                  onChange={(unit) =>
                    setAnswers((current) => ({ ...current, unit, budget: '' }))
                  }
                />
                {BUDGETS[answers.unit].map((budget) => (
                  <ChoiceCard
                    key={budget}
                    title={budget}
                    selected={answers.budget === budget}
                    onClick={() => {
                      setAnswers((current) => ({ ...current, budget }));
                      setResultCount(5);
                      go({ step: 'results' });
                    }}
                  />
                ))}
              </div>
            )}

            {screen.step === 'situation' && (
              <div className={styles.stack}>
                {SITUATIONS.map((item) => (
                  <ChoiceCard
                    key={item.value}
                    title={item.title}
                    description={item.description}
                    onClick={() =>
                      go({ step: 'curations', situation: item.value })
                    }
                  />
                ))}
              </div>
            )}
            {screen.step === 'curations' && (
              <div className={styles.stack}>
                {CURATIONS.filter(
                  (item) => item.situation === screen.situation,
                ).map((item) => (
                  <ChoiceCard
                    key={item.id}
                    title={item.title}
                    description={`${item.description} · ${item.ids.length}병`}
                    onClick={() => {
                      setResultCount(5);
                      go({
                        step: 'results',
                        curationId: item.id,
                        situation: screen.situation,
                      });
                    }}
                  />
                ))}
              </div>
            )}

            {screen.step === 'results' && (
              <div className={styles.stack}>
                {loading ? (
                  <p role="status" className={styles.loading}>
                    <span className={styles.spinner} aria-hidden="true" />한
                    잔을 고르고 있어요…
                  </p>
                ) : requestFailed ? (
                  <>
                    <p role="alert" className={styles.error}>
                      추천 목록을 불러오지 못했어요. 선택한 답변은 그대로
                      있어요.
                    </p>
                    <Button onClick={() => recommendations.refetch()}>
                      다시 불러오기
                    </Button>
                  </>
                ) : (
                  <>
                    <p className={styles.hint}>
                      {curation?.title ??
                        '추천 결과 화면의 예시입니다. 선택한 조건에 따른 실제 추천은 추후 연결돼요.'}
                    </p>
                    {!curation && (
                      <div className={styles.chips}>
                        {recommendationSummary.map((text) => (
                          <span className={styles.chip} key={text}>
                            {text}
                          </span>
                        ))}
                      </div>
                    )}
                    {resultBottles.slice(0, resultCount).map((bottle) => (
                      <BottleCard
                        key={bottle.id}
                        bottle={bottle}
                        onClick={() =>
                          go({ ...screen, step: 'bottle', bottleId: bottle.id })
                        }
                      />
                    ))}
                    {resultCount < resultBottles.length && (
                      <Button
                        variant="secondary"
                        onClick={() => setResultCount((value) => value + 5)}
                      >
                        다른 위스키도 볼게요
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {screen.step === 'bottle' && selectedBottle && (
              <div className={styles.stack}>
                <article className={styles.reviewCard}>
                  <BottleSummary bottle={selectedBottle} />
                  <dl className={styles.spec}>
                    <dt>지역</dt>
                    <dd>{selectedBottle.region}</dd>
                    <dt>한 잔 예시 가격</dt>
                    <dd>
                      {selectedBottle.glassPrice
                        ? `약 ${selectedBottle.glassPrice.toLocaleString()}원`
                        : '정보 없음'}
                    </dd>
                    <dt>한 병 예시 가격</dt>
                    <dd>
                      {selectedBottle.bottlePrice
                        ? `약 ${selectedBottle.bottlePrice.toLocaleString()}원`
                        : '정보 없음'}
                    </dd>
                  </dl>
                  <div className={styles.chips}>
                    {selectedBottle.tags.map((tag) => (
                      <span key={tag} className={styles.chip}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className={styles.hint}>
                    가격과 평점은 화면 확인용 예시 정보입니다.
                  </p>
                </article>
                <Button onClick={() => startReview(selectedBottle.id)}>
                  이 술로 리뷰를 써볼래요
                </Button>
                <Button
                  variant="secondary"
                  aria-pressed={picked.includes(selectedBottle.id)}
                  onClick={() => {
                    const alreadyPicked = picked.includes(selectedBottle.id);
                    setPicked((current) =>
                      alreadyPicked
                        ? current.filter((id) => id !== selectedBottle.id)
                        : [...current, selectedBottle.id],
                    );
                    setPickNotice(
                      alreadyPicked
                        ? '찜 선택을 해제했어요.'
                        : '찜 선택을 미리 봤어요. 실제로 저장되지는 않아요.',
                    );
                  }}
                >
                  <Heart
                    size={17}
                    aria-hidden="true"
                    fill={
                      picked.includes(selectedBottle.id)
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                  {picked.includes(selectedBottle.id)
                    ? '찜 선택됨 · 취소하기'
                    : '찜 동작 미리보기'}
                </Button>
                {pickNotice && (
                  <p role="status" className={styles.hint}>
                    {pickNotice}
                  </p>
                )}
                <Button variant="text" onClick={back}>
                  후보 목록으로 돌아가기
                </Button>
              </div>
            )}

            {screen.step === 'review-search' && (
              <BottleSearch
                query={reviewQuery}
                onQueryChange={setReviewQuery}
                onSelect={startReview}
              />
            )}
          </div>

          {/* The composer remains mounted while navigating so files and input state survive. */}
          {reviewBottle && (
            <div hidden={!isReview}>
              <ReviewSteps
                key={reviewSession}
                step={screen.step}
                bottle={reviewBottle}
                session={reviewSession}
                onNext={moveReview}
                onComplete={() => {
                  finishReview(reviewSession);
                  setCompleted(true);
                  setLastPlace(form.getValues('locationName') ?? '');
                  moveReview('review-complete');
                }}
                onMore={() => {
                  setReviewQuery('');
                  go({ step: 'review-search' });
                }}
                onHome={home}
              />
            </div>
          )}
          <p className={styles.footer}>오늘의 한 잔이, 내일의 취향이 되도록.</p>
        </section>
        {showExit && (
          <PromptModal
            mainText="바텐더 노트를 나갈까요?"
            subText="미리보기에서 고른 답변과 작성한 내용은 저장되지 않아요."
            actionText="나가기"
            closeText="계속 이야기할게요"
            onAction={() => {
              setShowExit(false);
              router.replace(ROUTES.HOME);
            }}
            onClose={() => setShowExit(false)}
          />
        )}
      </div>
    </FormProvider>
  );
}
