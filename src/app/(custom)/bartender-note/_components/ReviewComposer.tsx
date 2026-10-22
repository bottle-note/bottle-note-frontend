import { useEffect, useState, type ReactNode } from 'react';
import { TAGS_LIMIT, validateTagText } from '@/constants/review';
import type { ReviewDraft, Step } from './types';
import { FlowAction } from './FlowControls';
import type { Whiskey } from '../_data/demo';
import {
  noteKeywords,
  npfFeel,
  searchTags,
  tagSentence,
} from '../_data/reviewHelpers';

// 리뷰 본문은 서버에서 700자까지 받는다. 노즈·팔레트·피니시는 항목 이름과 함께 이어도 넘지 않게 나눈다.
const REVIEW_TEXT_MAX = 700;
const NOTE_FIELD_MAX = 220;

/** 플레이버 태그를 고르거나 직접 적어 넣는다. */
function TagEditor({
  review,
  reviewTags,
  suggestions,
  updateReview,
}: {
  review: ReviewDraft;
  reviewTags: string[];
  suggestions: string[];
  updateReview: (value: Partial<ReviewDraft>) => void;
}) {
  const [tagQuery, setTagQuery] = useState('');
  const addTag = (tag: string) => {
    const value = tag.trim();
    if (
      !value ||
      !validateTagText(value) ||
      reviewTags.includes(value) ||
      reviewTags.length >= TAGS_LIMIT
    )
      return;
    updateReview({
      tags: [...review.tags, value],
      excludedTags: review.excludedTags.filter((tag) => tag !== value),
    });
    setTagQuery('');
  };
  const tagMatches = searchTags(tagQuery, suggestions)
    .filter((tag) => !reviewTags.includes(tag))
    .slice(0, 8);
  return (
    <div className="flex flex-col gap-10 rounded-lg bg-bg-neutral-weak p-12">
      <p className="text-13 font-bold text-fg-neutral">
        플레이버 태그{' '}
        <span className="font-normal text-fg-neutral-muted">
          (선택 · {reviewTags.length}/{TAGS_LIMIT})
        </span>
      </p>
      {reviewTags.length > 0 && (
        <div className="flex flex-wrap gap-5">
          {reviewTags.map((tag) => (
            <button
              key={tag}
              className="rounded border border-stroke-brand-solid bg-bg-brand-weak px-7 py-4 text-12 leading-15 text-fg-brand"
              type="button"
              aria-label={`${tag} 태그 빼기`}
              onClick={() =>
                updateReview({
                  tags: review.tags.filter((value) => value !== tag),
                  excludedTags: [...review.excludedTags, tag],
                })
              }
            >
              {tag} ×
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-8 border-b border-stroke-neutral-weak">
        <input
          className="h-40 min-w-0 flex-1 bg-transparent text-14 text-fg-neutral outline-none placeholder:text-fg-placeholder"
          type="search"
          value={tagQuery}
          onChange={(event) => setTagQuery(event.target.value.slice(0, 20))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag(tagQuery);
            }
          }}
          placeholder="태그 검색 또는 직접 입력"
          aria-label="태그 검색 또는 직접 입력"
          disabled={reviewTags.length >= TAGS_LIMIT}
        />
        <button
          className="text-13 font-bold text-fg-brand disabled:opacity-45"
          type="button"
          onClick={() => addTag(tagQuery)}
          disabled={!tagQuery.trim() || reviewTags.length >= TAGS_LIMIT}
        >
          등록
        </button>
      </div>
      <div className="flex flex-wrap gap-5">
        {tagMatches.map((tag) => (
          <button
            key={tag}
            className="rounded border border-stroke-neutral-subtle bg-transparent px-7 py-4 text-11 leading-15 text-fg-neutral-muted"
            type="button"
            onClick={() => addTag(tag)}
          >
            ＋ {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = {
  step: Step;
  review: ReviewDraft;
  selected?: Whiskey;
  whiskeySummary: ReactNode;
  reviewTags: string[];
  updateReview: (value: Partial<ReviewDraft>) => void;
  move: (next: Step) => void;
  prepareGraph: () => void;
};

export default function ReviewComposer({
  step,
  review,
  selected,
  whiskeySummary,
  reviewTags,
  updateReview,
  move,
  prepareGraph,
}: Props) {
  const [keywordTab, setKeywordTab] = useState('향·맛');
  const [keywordSearch, setKeywordSearch] = useState('');
  useEffect(() => {
    setKeywordSearch('');
  }, [step]);
  const action = (label: string, onClick: () => void, disabled = false) => (
    <FlowAction onClick={onClick} disabled={disabled}>
      {label}
    </FlowAction>
  );
  const tagEditor = (
    <TagEditor
      review={review}
      reviewTags={reviewTags}
      suggestions={selected?.tags ?? []}
      updateReview={updateReview}
    />
  );
  const npfField =
    step === 'review-nose'
      ? 'nose'
      : step === 'review-palate'
        ? 'palate'
        : 'finish';
  const npfWords = keywordSearch.trim()
    ? searchTags(keywordSearch, selected?.tags ?? [])
    : [
        ...new Set([
          ...(selected?.tags.slice(0, step === 'review-finish' ? 6 : 12) ?? []),
          ...npfFeel[npfField],
        ]),
      ];
  return (
    <>
      {step === 'review-text' && (
        <>
          {whiskeySummary}
          <div className="overflow-hidden rounded-lg border border-stroke-neutral-subtle bg-bg-neutral-weak">
            <textarea
              className="min-h-140 w-full resize-y border-0 bg-transparent px-14 py-12 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
              value={review.text}
              onChange={(event) => updateReview({ text: event.target.value })}
              maxLength={REVIEW_TEXT_MAX}
              placeholder="아래 키워드를 눌러 보세요. 직접 써도 돼요."
              aria-label="리뷰 본문"
            />
            <div className="border-t border-stroke-neutral-subtle p-10">
              <div
                role="tablist"
                className="mb-10 flex gap-8 overflow-x-auto whitespace-nowrap"
              >
                {['향·맛', ...Object.keys(noteKeywords)].map((tab) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={keywordTab === tab}
                    key={tab}
                    className={
                      keywordTab === tab
                        ? 'border-b-2 border-stroke-brand-solid pb-5 text-13 font-bold text-fg-brand'
                        : 'pb-5 text-13 text-fg-neutral-muted'
                    }
                    onClick={() => setKeywordTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {keywordTab === '향·맛' && (
                <input
                  type="search"
                  className="mb-10 h-40 w-full border-b border-stroke-neutral-weak bg-transparent text-14 outline-none"
                  value={keywordSearch}
                  onChange={(event) => setKeywordSearch(event.target.value)}
                  placeholder="태그 검색 또는 직접 입력"
                  aria-label="향·맛 검색"
                />
              )}
              <div className="flex flex-wrap gap-5">
                {(keywordTab === '향·맛'
                  ? keywordSearch
                    ? searchTags(keywordSearch, selected?.tags ?? [])
                    : selected?.tags.slice(0, 10) ?? []
                  : noteKeywords[keywordTab] ?? []
                ).map((word) => {
                  const phrase =
                    keywordTab === '향·맛' ? tagSentence(word) : word;
                  const active = review.text.includes(phrase);
                  return (
                    <button
                      className={
                        active
                          ? 'rounded border border-stroke-brand-solid bg-bg-brand-weak px-7 py-4 text-12 text-fg-brand'
                          : 'rounded border border-stroke-neutral-subtle px-7 py-4 text-12 text-fg-neutral-muted'
                      }
                      type="button"
                      aria-pressed={active}
                      key={word}
                      onClick={() => {
                        const next = active
                          ? review.text
                              .replace(phrase, '')
                              .replace(/\s{2,}/g, ' ')
                              .trim()
                          : `${review.text.trim()}${review.text.trim() ? ' ' : ''}${phrase}`;
                        if (next.length <= REVIEW_TEXT_MAX)
                          updateReview({ text: next });
                      }}
                    >
                      {active ? '✓' : '＋'} {word.replace(/[.]$/, '')}
                    </button>
                  );
                })}
                {keywordTab === '향·맛' &&
                  keywordSearch.trim() &&
                  searchTags(keywordSearch, selected?.tags ?? []).length ===
                    0 &&
                  validateTagText(keywordSearch.trim()) && (
                    <button
                      type="button"
                      className="rounded border border-stroke-brand-solid px-7 py-4 text-12 text-fg-brand"
                      onClick={() => {
                        const next = `${review.text.trim()}${review.text.trim() ? ' ' : ''}${tagSentence(keywordSearch.trim())}`;
                        if (next.length <= REVIEW_TEXT_MAX)
                          updateReview({ text: next });
                        setKeywordSearch('');
                      }}
                    >
                      「{keywordSearch.trim()}」 그대로 넣기
                    </button>
                  )}
              </div>
            </div>
          </div>
          <p className="m-0 text-13 leading-17 text-fg-neutral-muted">
            {review.text.length} / {REVIEW_TEXT_MAX}
          </p>
          {tagEditor}
          {action('다 썼어요', prepareGraph, !review.text.trim())}
        </>
      )}
      {(step === 'review-nose' ||
        step === 'review-palate' ||
        step === 'review-finish') && (
        <>
          {whiskeySummary}
          <label
            className="text-13 font-bold text-fg-neutral"
            htmlFor="tastingText"
          >
            {step === 'review-nose'
              ? '노즈'
              : step === 'review-palate'
                ? '팔레트'
                : '피니시'}
          </label>
          <textarea
            id="tastingText"
            className="min-h-120 w-full resize-y rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 py-12 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
            value={
              step === 'review-nose'
                ? review.nose
                : step === 'review-palate'
                  ? review.palate
                  : review.finish
            }
            onChange={(event) =>
              updateReview({
                [step === 'review-nose'
                  ? 'nose'
                  : step === 'review-palate'
                    ? 'palate'
                    : 'finish']: event.target.value,
              })
            }
            placeholder="예) 사과, 꿀, 은은한 향"
            maxLength={NOTE_FIELD_MAX}
          />
          <input
            type="search"
            className="h-40 w-full border-b border-stroke-neutral-weak bg-transparent text-14 outline-none"
            value={keywordSearch}
            onChange={(event) => setKeywordSearch(event.target.value)}
            placeholder="태그 검색 또는 직접 입력"
            aria-label="향·맛 검색"
          />
          {!keywordSearch && (
            <p className="m-0 text-13 text-fg-neutral-muted">
              이 술 태그 · 느낌
            </p>
          )}
          <div className="flex flex-wrap gap-5">
            {npfWords.map((word) => (
              <button
                className={
                  review[npfField].split(/\s*,\s*/).includes(word)
                    ? 'rounded border border-stroke-brand-solid bg-bg-brand-weak px-7 py-4 text-12 text-fg-brand'
                    : 'rounded border border-stroke-neutral-subtle px-7 py-4 text-12 text-fg-neutral-muted'
                }
                type="button"
                key={word}
                onClick={() => {
                  const parts = review[npfField]
                    .split(/\s*,\s*/)
                    .filter(Boolean);
                  const next = parts.includes(word)
                    ? parts.filter((part) => part !== word).join(', ')
                    : [...parts, word].join(', ');
                  if (next.length <= NOTE_FIELD_MAX)
                    updateReview({ [npfField]: next });
                  setKeywordSearch('');
                }}
              >
                {review[npfField].split(/\s*,\s*/).includes(word) ? '✓' : '＋'}{' '}
                {word}
              </button>
            ))}
            {keywordSearch.trim() &&
              npfWords.length === 0 &&
              validateTagText(keywordSearch.trim()) && (
                <button
                  type="button"
                  className="rounded border border-stroke-brand-solid px-7 py-4 text-12 text-fg-brand"
                  onClick={() => {
                    const next = `${review[npfField]}${review[npfField] ? ', ' : ''}${keywordSearch.trim()}`;
                    if (next.length <= NOTE_FIELD_MAX)
                      updateReview({ [npfField]: next });
                    setKeywordSearch('');
                  }}
                >
                  「{keywordSearch.trim()}」 그대로 넣기
                </button>
              )}
          </div>
          {step === 'review-finish' && tagEditor}
          {action(
            '다음으로',
            () => {
              if (step === 'review-finish') prepareGraph();
              else
                move(
                  step === 'review-nose' ? 'review-palate' : 'review-finish',
                );
            },
            step === 'review-finish' &&
              !review.nose.trim() &&
              !review.palate.trim() &&
              !review.finish.trim(),
          )}
        </>
      )}
    </>
  );
}
