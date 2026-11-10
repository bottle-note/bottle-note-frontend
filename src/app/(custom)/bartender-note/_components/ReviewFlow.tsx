import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import AlcoholRatingInput from '@/components/domain/alcohol/AlcoholRatingInput';
import AnimatedCollapse from '@/components/ui/Display/AnimatedCollapse';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import TastingRadarChart from '@/app/(primary)/review/_components/form/TastingRadarChart';
import { TASTING_AXES, TASTING_MAX_VALUE } from '@/constants/tastingNote';
import SearchBarLink from '@/components/feature/Search/SearchBarLink';
import type { ReviewDraft, Step } from './types';
import { OptionList, FlowAction } from './FlowControls';
import ReviewPickStep from './ReviewPickStep';
import PlaceSearchStep from './PlaceSearchStep';
import { prefersReducedMotion } from './prefersReducedMotion';
import RadarPreview from './RadarPreview';
import ReviewComposer from './ReviewComposer';
import { OptionTitle, ReviewSegmented, reviewChip } from './ReviewInputs';
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
  /** 한 단계 되짚는다. 장소를 고르면 장소·가격 단계로 돌아갈 때 쓴다. */
  back: () => void;
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
  back,
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
  const bottleImage = (size: 40 | 44) => (
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
          <b className="truncate text-15 font-bold">{selected.name}</b>
          <small className="text-13 text-fg-neutral-muted">
            {[selected.category, selected.abv && `${selected.abv}%`]
              .filter(Boolean)
              .join(' · ')}
          </small>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-14 text-fg-brand">
          {infoOpen ? '접기' : '술 정보'}
          <ChevronDown
            aria-hidden="true"
            className={`h-18 w-18 transition-transform duration-200 motion-reduce:transition-none ${infoOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      <AnimatedCollapse isOpen={infoOpen}>
        <div className="break-keep border-t border-stroke-neutral-subtle px-12 py-10 text-14 leading-21 text-fg-neutral-muted">
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
            <span key={tag} className={reviewChip.selected}>
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
          review.place?.name,
          review.price && review.unit
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
                  action: () => {
                    chooseMode('quick');
                    move('review-text');
                  },
                },
                {
                  title: '노즈 · 팔레트 · 피니시로 쓸게요',
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
          <section className="flex flex-col gap-8">
            <OptionTitle iconSrc="/icon/marker-subcoral.svg">장소</OptionTitle>
            <SearchBarLink
              ariaLabel={
                review.place ? `장소 ${review.place.name} 바꾸기` : '장소 검색'
              }
              placeholder="장소 검색"
              keyword={review.place?.name}
              onOpen={() => move('review-place')}
              onClear={() => updateReview({ place: null })}
            />
            {review.place && (
              <p className="m-0 px-4 text-13 text-fg-neutral-muted">
                {[review.place.category, review.place.address]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </section>
          <section className="flex flex-col gap-8">
            <OptionTitle iconSrc="/icon/money-subcoral.svg">가격</OptionTitle>
            {/* 선택 입력이라 고른 단위를 다시 누르면 해제한다. 단위가 없으면 금액도 비운다 */}
            <ReviewSegmented
              label="가격 단위"
              value={review.unit}
              options={[
                { value: 'glass', label: '1잔' },
                { value: 'bottle', label: '보틀(1병)' },
              ]}
              onChange={(unit) =>
                updateReview(
                  unit === review.unit ? { unit: null, price: '' } : { unit },
                )
              }
            />
            <div className="flex h-28 items-center border-b border-stroke-brand-solid text-15 has-[:disabled]:opacity-45">
              <input
                aria-label="가격"
                className="h-full min-w-0 flex-1 bg-transparent pr-8 text-15 text-fg-neutral outline-none placeholder:text-fg-neutral-muted focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
                inputMode="numeric"
                disabled={!review.unit}
                value={review.price}
                onChange={(event) =>
                  updateReview({
                    price: event.target.value.replace(/\D/g, ''),
                  })
                }
                placeholder="얼마에 마셨는지 기록해보세요!"
              />
              <span className="shrink-0 text-fg-brand">원</span>
            </div>
          </section>
          {/* 장소·가격은 선택 입력이라 버튼 하나로 넘어간다. 다른 단계처럼 입력 여부에 따라 문구만 바꾼다 */}
          {action(
            review.place || review.price
              ? '다 됐어요'
              : '장소·가격 없이 넘어갈게요',
            () => move('review-preview'),
          )}
        </>
      )}
      {step === 'review-place' && (
        <PlaceSearchStep
          onPick={(place) => {
            updateReview({ place });
            back();
          }}
        />
      )}
      {step === 'review-preview' && (
        <>
          {whiskeySummary}
          {renderReviewCard()}
          <ReviewSegmented
            label="리뷰 공개 범위"
            value={review.public ? 'public' : 'private'}
            options={[
              { value: 'public', label: '공개' },
              { value: 'private', label: '비공개' },
            ]}
            onChange={(value) => updateReview({ public: value === 'public' })}
          />
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
              action: onViewPostedReview,
            },
            {
              title: '다른 술도 기록할게요',
              // 장소를 이어 채운다는 건 설명이 아니라 다음 동작이라 남긴다
              description: review.place
                ? `「${review.place.name}」 장소는 이어서 채워 둘게요`
                : undefined,
              action: startAnotherReview,
            },
            {
              title: '처음으로 갈게요',
              action: home,
            },
          ])}
        </>
      )}
    </>
  );
}
