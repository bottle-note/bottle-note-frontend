import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import AlcoholRatingInput from '@/components/domain/alcohol/AlcoholRatingInput';
import AnimatedCollapse from '@/components/ui/Display/AnimatedCollapse';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import TastingRadarChart from '@/app/(primary)/review/_components/form/TastingRadarChart';
import { TASTING_AXES, TASTING_MAX_VALUE } from '@/constants/tastingNote';
import type { ReviewDraft, Step } from './types';
import {
  OptionList,
  FlowAction,
  FlowNavigation,
  FlowTextAction,
} from './FlowControls';
import { WhiskeyImage } from './WhiskeyRow';
import ReviewPickStep from './ReviewPickStep';
import { prefersReducedMotion } from './prefersReducedMotion';
import RadarPreview from './RadarPreview';
import ReviewComposer from './ReviewComposer';
import type { ReviewAlcohol } from './reviewAlcohol';
import {
  flavorFromText,
  getReviewTags,
  getReviewText,
} from '../_data/reviewHelpers';

const graphLabels = TASTING_AXES.map((axis) => axis.labelKo);
function PhotoThumb({ file, onRemove }: { file: File; onRemove?: () => void }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return (
    <div className="relative h-72 w-72 overflow-hidden rounded-md bg-bg-neutral-weak">
      {url && (
        <Image
          src={url}
          alt={file.name}
          width={72}
          height={72}
          unoptimized
          className="h-full w-full object-cover"
        />
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={`${file.name} 사진 빼기`}
          onClick={onRemove}
          className="absolute right-2 top-2 grid h-20 w-20 place-items-center rounded-full bg-bg-layer-basement text-14 text-fg-neutral"
        >
          ×
        </button>
      )}
    </div>
  );
}

type Props = {
  step: Step;
  review: ReviewDraft;
  updateReview: (value: Partial<ReviewDraft>) => void;
  selected?: ReviewAlcohol;
  move: (next: Step) => void;
  home: () => void;
  onPickAlcohol: (alcoholId: number) => void;
  lastReviewMode: ReviewDraft['mode'];
  chooseMode: (mode: ReviewDraft['mode']) => void;
  postReview: () => void;
  isPosting: boolean;
  onViewPostedReview: () => void;
  startAnotherReview: () => void;
};

export default function ReviewFlow({
  step,
  review,
  updateReview,
  selected,
  move,
  home,
  onPickAlcohol,
  lastReviewMode,
  chooseMode,
  postReview,
  isPosting,
  onViewPostedReview,
  startAnotherReview,
}: Props) {
  const [infoOpen, setInfoOpen] = useState(false);
  const ratingCommitTimer = useRef<number | null>(null);
  useEffect(() => {
    if (ratingCommitTimer.current !== null)
      window.clearTimeout(ratingCommitTimer.current);
  }, [step]);
  const optionList = (items: Parameters<typeof OptionList>[0]['items']) => (
    <OptionList items={items} />
  );
  const action = (label: string, onClick: () => void, disabled = false) => (
    <FlowAction onClick={onClick} disabled={disabled}>
      {label}
    </FlowAction>
  );
  const bottleImage = (size: 40 | 44) =>
    selected?.demoWhiskey ? (
      <WhiskeyImage whiskey={selected.demoWhiskey} size={size} />
    ) : (
      <AlcoholImage
        imageUrl={selected?.imageUrl ?? ''}
        outerHeightClass={size === 40 ? 'h-40' : 'h-44'}
        outerWidthClass={size === 40 ? 'w-40' : 'w-44'}
        innerHeightClass={size === 40 ? 'h-32' : 'h-36'}
        innerWidthClass="w-24"
      />
    );
  const whiskeySummary = selected && (
    <div className="rounded-lg border border-stroke-neutral-subtle">
      <button
        type="button"
        aria-expanded={infoOpen}
        className="flex w-full items-center gap-10 p-8 text-left"
        onClick={() => setInfoOpen(!infoOpen)}
      >
        {bottleImage(40)}
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <b className="truncate text-14 font-bold">{selected.name}</b>
          <small className="text-12 text-fg-neutral-muted">
            {[selected.category, selected.abv && `${selected.abv}%`]
              .filter(Boolean)
              .join(' · ')}
          </small>
        </span>
        <span className="text-12 text-fg-brand">
          {infoOpen ? '접기 ⌃' : '술 정보 ⌄'}
        </span>
      </button>
      <AnimatedCollapse isOpen={infoOpen}>
        <div className="border-t border-stroke-neutral-subtle px-12 py-10 text-13 text-fg-neutral-muted">
          <p className="m-0">
            {[
              selected.category,
              selected.region,
              selected.abv && `${selected.abv}%`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mb-0 mt-4">
            {selected.rating === null
              ? '평가 없음'
              : `★ ${selected.rating.toFixed(1)}${selected.ratingCount ? ` · 평가 ${selected.ratingCount}건` : ''}`}
          </p>
          {(selected.glassPrice !== undefined ||
            selected.bottlePrice !== undefined) && (
            <p className="mb-0 mt-4">
              대략 가격 ·{' '}
              {selected.glassPrice
                ? `한 잔 ${selected.glassPrice.toLocaleString()}원`
                : '한 잔 정보 없음'}{' '}
              ·{' '}
              {selected.bottlePrice
                ? `한 병 ${selected.bottlePrice.toLocaleString()}원`
                : '한 병 정보 없음'}
            </p>
          )}
          {selected.tags.length > 0 && (
            <p className="mb-0 mt-8">
              {selected.tags.slice(0, 10).join(' · ')}
            </p>
          )}
          {selected.description && (
            <p className="mb-0 mt-8 text-fg-neutral">{selected.description}</p>
          )}
        </div>
      </AnimatedCollapse>
    </div>
  );
  const reviewText = getReviewText(review);
  const reviewTags = getReviewTags(review);
  const prepareGraph = () => {
    if (!review.tastingAuto && review.tasting.every((value) => value === 0)) {
      const inferred = flavorFromText(reviewText);
      updateReview({ tasting: inferred.values, tastingAuto: true });
    }
    move('review-graph');
  };
  const tastingAxes = TASTING_AXES.map((axis, index) => ({
    name: axis.labelKo,
    score: review.tasting[index] ?? 0,
  }));
  const renderReviewCard = (posted = false) => (
    <div className="flex flex-col gap-8 rounded-xl bg-bg-neutral-weak p-16">
      {posted && (
        <b className="text-13 text-fg-brand">
          ✓ 등록됨 · {review.public ? '공개' : '비공개'}
        </b>
      )}
      {selected && (
        <div className="flex items-center gap-8">
          {bottleImage(44)}
          <b className="text-15">{selected.name}</b>
        </div>
      )}
      <b className="text-fg-rating">
        {review.rating ? `★ ${review.rating.toFixed(1)}` : '별점 없음'}
      </b>
      <p className="m-0 whitespace-pre-wrap text-15">{reviewText}</p>
      {review.tasting.some(Boolean) && (
        <div className="flex justify-center">
          <RadarPreview values={review.tasting} />
        </div>
      )}
      {reviewTags.length > 0 && (
        <div className="flex flex-wrap gap-5">
          {reviewTags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-bg-brand-weak px-7 py-4 text-11 text-fg-brand"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {review.photos.length > 0 && posted && (
        <div className="flex flex-wrap gap-5">
          {review.photos.map((file) => (
            <PhotoThumb
              key={`${file.name}-${file.lastModified}-${file.size}`}
              file={file}
            />
          ))}
        </div>
      )}
      <small className="text-13 text-fg-neutral-muted">
        {[
          review.place,
          review.price
            ? `${Number(review.price).toLocaleString()}원 / ${review.unit === 'glass' ? '1잔' : '보틀'}`
            : '',
          review.photos.length ? `사진 ${review.photos.length}장` : '',
        ]
          .filter(Boolean)
          .join(' · ')}
      </small>
    </div>
  );

  return (
    <>
      {step === 'review-pick' && (
        <ReviewPickStep
          onPick={(alcohol) => {
            setInfoOpen(false);
            onPickAlcohol(alcohol);
          }}
        />
      )}
      {step === 'review-mode' && (
        <>
          {whiskeySummary}
          {optionList(
            (
              [
                {
                  title: '내 느낌 한 줄로 쓸게요',
                  description: '키워드를 고르거나 직접 적어요',
                  action: () => {
                    chooseMode('quick');
                    move('review-text');
                  },
                },
                {
                  title: '노즈 · 팔레트 · 피니시로 쓸게요',
                  description: '향 · 맛 · 여운을 따로 적어요',
                  action: () => {
                    chooseMode('detail');
                    move('review-nose');
                  },
                },
              ] as Parameters<typeof OptionList>[0]['items']
            ).sort((a, b) => {
              const preferred = lastReviewMode === 'quick' ? '내 느낌' : '노즈';
              return (
                Number(b.title.startsWith(preferred)) -
                Number(a.title.startsWith(preferred))
              );
            }),
          )}
        </>
      )}
      <ReviewComposer
        step={step}
        review={review}
        selected={selected}
        whiskeySummary={whiskeySummary}
        reviewTags={reviewTags}
        updateReview={updateReview}
        move={move}
        prepareGraph={prepareGraph}
      />
      {step === 'review-graph' && (
        <>
          {whiskeySummary}
          <div className="flex flex-col gap-8 rounded-xl bg-bg-neutral-weak p-14">
            <div className="mb-8 mt-8 flex justify-center">
              <TastingRadarChart
                axes={tastingAxes}
                maxScore={TASTING_MAX_VALUE}
                size={280}
                onAxisChange={(index, value) => {
                  updateReview({
                    tasting: review.tasting.map((current, position) =>
                      position === index ? value : current,
                    ),
                  });
                }}
              />
            </div>
            <p className="m-0 text-center text-13 text-fg-neutral-muted">
              차트를 누르거나 원을 끌어서 조절하세요
            </p>
            {review.tastingAuto &&
              flavorFromText(reviewText).hits.length > 0 && (
                <p className="m-0 text-center text-13 text-fg-brand">
                  「{flavorFromText(reviewText).hits.slice(0, 4).join(' · ')}
                  」에서 대략 채웠어요
                </p>
              )}
            {graphLabels.map((label, index) => (
              <label key={label} className="flex flex-col gap-4 text-13">
                <span className="flex justify-between">
                  {label} <b>{review.tasting[index]}</b>
                </span>
                <input
                  className="w-full accent-bg-brand-solid"
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={review.tasting[index]}
                  onChange={(event) =>
                    updateReview({
                      tasting: review.tasting.map((value, position) =>
                        position === index ? Number(event.target.value) : value,
                      ),
                    })
                  }
                />
              </label>
            ))}
          </div>
          {review.tasting.some(Boolean) && (
            <button
              type="button"
              className="self-end text-13 text-fg-neutral-muted"
              onClick={() => updateReview({ tasting: [0, 0, 0, 0, 0, 0] })}
            >
              초기화
            </button>
          )}
          {action(
            review.tasting.some(Boolean)
              ? '다 그렸어요'
              : '그래프 없이 넘어갈게요',
            () => move('review-photo'),
          )}
        </>
      )}
      {step === 'review-photo' && (
        <>
          {whiskeySummary}
          <label className="grid min-h-90 cursor-pointer place-items-center rounded-lg border border-dashed border-stroke-neutral-weak text-fg-brand">
            ＋ 사진 고르기
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const next = [...review.photos];
                Array.from(event.target.files ?? []).forEach((file) => {
                  if (
                    !next.some(
                      (item) =>
                        item.name === file.name &&
                        item.lastModified === file.lastModified &&
                        item.size === file.size,
                    )
                  )
                    next.push(file);
                });
                updateReview({ photos: next.slice(0, 5) });
                const fileInput = event.currentTarget;
                fileInput.value = '';
              }}
            />
          </label>
          <p className="m-0 text-13 leading-17 text-fg-neutral-muted">
            최대 5장 · {review.photos.length}장 선택됨
          </p>
          {review.photos.length > 0 && (
            <div className="flex flex-wrap gap-5">
              {review.photos.map((file, index) => (
                <PhotoThumb
                  key={`${file.name}-${file.lastModified}-${file.size}`}
                  file={file}
                  onRemove={() =>
                    updateReview({
                      photos: review.photos.filter(
                        (_, position) => position !== index,
                      ),
                    })
                  }
                />
              ))}
            </div>
          )}
          {action(
            review.photos.length
              ? '사진과 함께 넘어갈게요'
              : '사진 없이 넘어갈게요',
            () => move('review-rating'),
          )}
        </>
      )}
      {step === 'review-rating' && (
        <>
          {whiskeySummary}
          <p className="text-center text-13 text-fg-neutral-muted">
            이 술에 대한 평가를 남겨보세요.
          </p>
          <div className="flex justify-center overflow-x-auto">
            <AlcoholRatingInput
              value={review.rating}
              onChange={(rating) => {
                if (ratingCommitTimer.current !== null)
                  window.clearTimeout(ratingCommitTimer.current);
                updateReview({ rating });
              }}
              onCommit={() => {
                ratingCommitTimer.current = window.setTimeout(
                  () => move('review-where'),
                  prefersReducedMotion() ? 0 : 850,
                );
              }}
            />
          </div>
          <p className="text-center font-extrabold text-fg-rating">
            {review.rating
              ? `${review.rating.toFixed(1)}점`
              : '별점은 선택 사항이에요'}
          </p>
          {action(review.rating ? '다음으로' : '별점 없이 넘어갈게요', () => {
            if (ratingCommitTimer.current !== null)
              window.clearTimeout(ratingCommitTimer.current);
            move('review-where');
          })}
        </>
      )}
      {step === 'review-where' && (
        <>
          {whiskeySummary}
          <label
            className="text-13 font-bold text-fg-neutral"
            htmlFor="reviewPlace"
          >
            장소 (선택)
          </label>
          <input
            id="reviewPlace"
            className="h-46 w-full rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
            value={review.place}
            onChange={(event) => updateReview({ place: event.target.value })}
            placeholder="바 이름이나 집"
          />
          <label
            className="text-13 font-bold text-fg-neutral"
            htmlFor="reviewPrice"
          >
            가격 (선택)
          </label>
          <div
            className="grid grid-cols-2 gap-4 rounded-lg bg-bg-neutral-weak p-4 [&>button]:min-h-40 [&>button]:rounded-md [&>button]:text-13 [&>button]:text-fg-neutral-muted [&>button[aria-pressed=true]]:bg-bg-brand-weak [&>button[aria-pressed=true]]:font-bold [&>button[aria-pressed=true]]:text-fg-brand"
            role="group"
            aria-label="가격 단위"
          >
            <button
              type="button"
              aria-pressed={review.unit === 'glass'}
              onClick={() => updateReview({ unit: 'glass' })}
            >
              1잔
            </button>
            <button
              type="button"
              aria-pressed={review.unit === 'bottle'}
              onClick={() => updateReview({ unit: 'bottle' })}
            >
              보틀(1병)
            </button>
          </div>
          <input
            id="reviewPrice"
            className="h-46 w-full rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
            inputMode="numeric"
            value={review.price}
            onChange={(event) =>
              updateReview({
                price: event.target.value.replace(/\D/g, ''),
              })
            }
            placeholder="금액 (원)"
          />
          <FlowNavigation>
            <FlowTextAction
              onClick={() => {
                updateReview({ place: '', price: '' });
                move('review-preview');
              }}
            >
              장소와 가격 건너뛰기
            </FlowTextAction>
          </FlowNavigation>
          {action('다 됐어요', () => move('review-preview'))}
        </>
      )}
      {step === 'review-preview' && (
        <>
          {whiskeySummary}
          <div
            className="grid grid-cols-2 gap-4 rounded-lg bg-bg-neutral-weak p-4 [&>button]:min-h-40 [&>button]:rounded-md [&>button]:text-13 [&>button]:text-fg-neutral-muted [&>button[aria-pressed=true]]:bg-bg-brand-weak [&>button[aria-pressed=true]]:font-bold [&>button[aria-pressed=true]]:text-fg-brand"
            role="group"
            aria-label="리뷰 공개 범위"
          >
            <button
              type="button"
              aria-pressed={review.public}
              onClick={() => updateReview({ public: true })}
            >
              공개
            </button>
            <button
              type="button"
              aria-pressed={!review.public}
              onClick={() => updateReview({ public: false })}
            >
              비공개
            </button>
          </div>
          {renderReviewCard()}
          {action(
            isPosting ? '올리고 있어요…' : '이걸로 등록할게요',
            postReview,
            isPosting,
          )}
        </>
      )}
      {step === 'review-done' && (
        <>
          {renderReviewCard(true)}
          {optionList([
            {
              title: '내 리뷰 볼게요',
              description: '방금 남긴 기록 보기',
              action: onViewPostedReview,
            },
            {
              title: '다른 술도 기록할게요',
              description: review.place
                ? `「${review.place}」 장소는 이어서 채워 둘게요`
                : '지금 자리에서 마신 다른 술',
              action: startAnotherReview,
            },
            {
              title: '처음으로 갈게요',
              description: '추천받거나 다른 걸 해요',
              action: home,
            },
          ])}
        </>
      )}
    </>
  );
}
