'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import AlcoholRatingInput from '@/components/domain/alcohol/AlcoholRatingInput';
import SegmentedControl from '@/components/ui/Form/SegmentedControl';
import ImageUploader from '@/components/ui/Form/ImageUploader';
import {
  TAGS_LIMIT,
  TAG_MAX_LENGTH,
  validateTagText,
} from '@/constants/review';
import type { FormValues } from '@/types/Review';
import { BottleSummary } from './BottleCard';
import type { Bottle, Step } from '../_lib/experience';
import previewTags from '../_data/tags.json';
import styles from '../bartender.module.css';

interface Props {
  step: Step;
  bottle: Bottle;
  session: number;
  onNext: (step: Step) => void;
  onComplete: () => void;
  onMore: () => void;
  onHome: () => void;
}

const COMMON_TAGS = [
  '바닐라',
  '꿀',
  '오크',
  '피트',
  '스모키',
  '건과일',
  '셰리',
  '과일',
  '시트러스',
  '초콜릿',
  '부드러운',
  '긴 여운',
  '스파이스',
  '캐러멜',
];
const STARTERS = ['첫 향은 ', '입에 넣으면 ', '마시고 나면 '];
const UNITS = [
  { value: 'GLASS', label: '1잔' },
  { value: 'BOTTLE', label: '보틀(1병)' },
] as const;
const VISIBILITY = [
  { value: 'PUBLIC', label: '공개' },
  { value: 'PRIVATE', label: '비공개' },
] as const;

function PhotoPreview({ files }: { files: NonNullable<FormValues['images']> }) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const next = files.map(({ image }) => URL.createObjectURL(image));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  return (
    <div className={styles.photos}>
      {urls.map((url, index) => (
        // Local object URLs are already sized by the uploader; no image proxy is needed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt={`첨부 사진 ${index + 1}`}
          className={styles.photo}
        />
      ))}
    </div>
  );
}

export default function ReviewSteps({
  step,
  bottle,
  session,
  onNext,
  onComplete,
  onMore,
  onHome,
}: Props) {
  const { watch, setValue, register } = useFormContext<FormValues>();
  const values = watch();
  const tags = values.flavor_tags ?? [];
  const rating = values.rating ?? 0;
  const [tagQuery, setTagQuery] = useState('');
  const [tagError, setTagError] = useState('');
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const tagOptions = Array.from(
    new Set(tagQuery.trim() ? previewTags : [...bottle.tags, ...COMMON_TAGS]),
  ).filter((tag) => tag.includes(tagQuery.trim()) && !tags.includes(tag));
  const content = values.review.trim();
  const isContentValid =
    !!content &&
    content.length <= 700 &&
    !STARTERS.some((stem) => stem.trim() === content);
  const textRegistration = register('review');
  const scoreLine =
    rating >= 4.5
      ? '또 마시고 싶은 한 잔.'
      : rating >= 3.5
        ? '만족스럽게 즐긴 한 잔.'
        : rating >= 2.5
          ? '한 번 더 천천히 마셔 보고 싶다.'
          : '내 취향과는 조금 달랐다.';

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tags.includes(tag)) {
      setTagError('이미 고른 태그예요.');
      return;
    }
    if (tags.length >= TAGS_LIMIT) {
      setTagError('태그는 최대 15개까지 고를 수 있어요.');
      return;
    }
    if (!tag || tag.length > TAG_MAX_LENGTH || !validateTagText(tag)) {
      setTagError('태그는 한글·영문·공백으로 12자 이내로 적어 주세요.');
      return;
    }
    setValue('flavor_tags', [...tags, tag], { shouldDirty: true });
    setTagQuery('');
    setTagError('');
  };
  const insertText = (text: string) => {
    const existing = values.review.trimEnd();
    const next = `${existing}${existing ? '\n' : ''}${text}`;
    if (next.length > 700) return;
    setValue('review', next, { shouldDirty: true });
    requestAnimationFrame(() => {
      textRef.current?.focus();
      textRef.current?.setSelectionRange(next.length, next.length);
    });
  };

  return (
    <div className={styles.stack}>
      {step === 'review-rating' && (
        <>
          <BottleSummary bottle={bottle} />
          <div className={styles.ratingInput}>
            <AlcoholRatingInput
              value={rating}
              onChange={(value) =>
                setValue('rating', value, { shouldDirty: true })
              }
            />
            <p className={styles.ratingValue} aria-live="polite">
              {rating ? `${rating.toFixed(1)}점` : '별점을 골라 주세요'}
            </p>
            <p className={styles.hint}>
              0.5점씩, 별을 누르거나 좌우로 움직여 보세요.
            </p>
          </div>
          <Button disabled={rating < 0.5} onClick={() => onNext('review-tags')}>
            이 점수로 할게요
          </Button>
        </>
      )}

      {step === 'review-tags' && (
        <>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>향과 맛 태그</span>
            <input
              className={styles.input}
              value={tagQuery}
              maxLength={TAG_MAX_LENGTH}
              placeholder="예) 바닐라, 피트"
              onChange={(event) => {
                setTagQuery(event.target.value);
                setTagError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  addTag(tagQuery);
                }
              }}
            />
          </label>
          <p className={styles.hint}>
            {tags.length} / {TAGS_LIMIT}개 선택
          </p>
          <div className={styles.chips}>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`${styles.chip} ${styles.chipSelected}`}
                aria-label={`${tag} 태그 빼기`}
                onClick={() =>
                  setValue(
                    'flavor_tags',
                    tags.filter((value) => value !== tag),
                    { shouldDirty: true },
                  )
                }
              >
                {tag} ×
              </button>
            ))}
          </div>
          <p className={styles.hint}>
            {tagQuery ? '태그 검색 결과' : '이 위스키의 향에서 골라 보세요.'}
          </p>
          <div className={styles.chips}>
            {tagOptions.slice(0, 14).map((tag) => (
              <button
                type="button"
                className={styles.chip}
                key={tag}
                onClick={() => addTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          {tagQuery.trim() &&
            !tagOptions.includes(tagQuery.trim()) &&
            !tags.includes(tagQuery.trim()) && (
              <Button
                size="md"
                variant="secondary"
                onClick={() => addTag(tagQuery)}
              >
                ‘{tagQuery.trim()}’ 직접 추가
              </Button>
            )}
          {tagError && (
            <p role="alert" className={styles.error}>
              {tagError}
            </p>
          )}
          <Button onClick={() => onNext('review-text')}>
            {tags.length ? '다 골랐어요' : '태그 없이 넘어갈게요'}
          </Button>
        </>
      )}

      {step === 'review-text' && (
        <>
          {tags.length > 0 && (
            <div className={styles.chips}>
              {tags.map((tag) => (
                <span
                  className={`${styles.chip} ${styles.chipSelected}`}
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <label className={styles.field}>
            <span className={styles.fieldLabel}>리뷰 본문</span>
            <textarea
              {...textRegistration}
              ref={(element) => {
                textRegistration.ref(element);
                textRef.current = element;
              }}
              className={styles.textarea}
              maxLength={700}
              placeholder="언제, 어떤 기분으로 마셨는지 한 줄이면 충분해요."
            />
          </label>
          <p className={styles.count}>{values.review.length} / 700</p>
          <p className={styles.hint}>
            이렇게 시작해 보셔도 좋아요. 이미 쓴 글 뒤에 붙여 드려요.
          </p>
          <div className={styles.chips}>
            <button
              type="button"
              className={styles.chip}
              onClick={() => insertText(scoreLine)}
            >
              {scoreLine} · ★ {rating.toFixed(1)}
            </button>
            {STARTERS.map((stem) => (
              <button
                type="button"
                key={stem}
                className={styles.chip}
                onClick={() => insertText(stem)}
              >
                {stem}…
              </button>
            ))}
          </div>
          <Button
            disabled={!isContentValid}
            onClick={() => onNext('review-extras')}
          >
            다 썼어요
          </Button>
        </>
      )}

      {/* Keep the shared uploader mounted between steps so selected File objects and previews survive editing. */}
      <div hidden={step !== 'review-extras'}>
        <div className={styles.stack}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              장소 <span className={styles.hint}>(선택)</span>
            </span>
            <input
              className={styles.input}
              {...register('locationName')}
              maxLength={100}
              placeholder="바 이름이나 집"
            />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              가격 <span className={styles.hint}>(선택)</span>
            </span>
            <SegmentedControl
              label="가격 단위"
              value={values.price_type ?? 'GLASS'}
              options={UNITS}
              onChange={(value) =>
                setValue('price_type', value, { shouldDirty: true })
              }
            />
            <label className={styles.field}>
              <span className="sr-only">가격 (원)</span>
              <input
                className={styles.input}
                inputMode="numeric"
                value={values.price ?? ''}
                placeholder="금액 (원)"
                onChange={(event) => {
                  const digits = event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 13);
                  setValue(
                    'price',
                    digits ? Math.min(Number(digits), 1_000_000_000_000) : null,
                    { shouldDirty: true },
                  );
                }}
              />
            </label>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              사진 <span className={styles.hint}>(선택·최대 5장)</span>
            </span>
            <ImageUploader key={session} useMarginLeft={false} />
          </div>
          <div className={styles.actions}>
            <Button onClick={() => onNext('review-confirm')}>
              기록 미리보기
            </Button>
            <Button variant="text" onClick={() => onNext('review-confirm')}>
              추가 입력 없이 넘어갈게요
            </Button>
          </div>
        </div>
      </div>

      {(step === 'review-confirm' || step === 'review-complete') && (
        <>
          {step === 'review-complete' && (
            <p className={styles.completion}>
              <Check size={20} aria-hidden="true" />
              기록 미리보기 완료
            </p>
          )}
          <article
            className={styles.reviewCard}
            aria-label="작성한 리뷰 미리보기"
          >
            <BottleSummary bottle={bottle} />
            <p className={styles.rating}>
              내 별점 ★ {rating.toFixed(1)} ·{' '}
              {values.status === 'PRIVATE' ? '비공개' : '공개'}
            </p>
            <p className={styles.reviewBody}>{values.review}</p>
            <div className={styles.chips}>
              {tags.map((tag) => (
                <span key={tag} className={styles.chip}>
                  {tag}
                </span>
              ))}
            </div>
            {(values.images?.length ?? 0) > 0 && (
              <PhotoPreview files={values.images!} />
            )}
            <p className={styles.hint}>
              {[
                values.locationName,
                values.price !== null
                  ? `${Number(values.price).toLocaleString()}원 / ${values.price_type === 'BOTTLE' ? '1병' : '1잔'}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </article>
          {step === 'review-confirm' ? (
            <>
              <SegmentedControl
                label="리뷰 공개 범위"
                value={values.status as 'PUBLIC' | 'PRIVATE'}
                options={VISIBILITY}
                onChange={(value) =>
                  setValue('status', value, { shouldDirty: true })
                }
              />
              <p className={styles.hint}>
                지금은 화면 미리보기예요. 리뷰는 실제로 등록되지 않아요.
              </p>
              <Button
                disabled={!isContentValid || rating < 0.5}
                onClick={onComplete}
              >
                이 기록으로 완료해 볼게요
              </Button>
              <div className={styles.actionPair}>
                <Button
                  size="md"
                  variant="text"
                  onClick={() => onNext('review-text')}
                >
                  본문 수정
                </Button>
                <Button
                  size="md"
                  variant="text"
                  onClick={() => onNext('review-extras')}
                >
                  추가 정보 수정
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className={styles.hint}>
                실제 리뷰는 등록되지 않았어요. 한 잔 더 기록하면 장소를 이어서
                채워 드려요.
              </p>
              <Button onClick={onMore}>다른 술도 기록할게요</Button>
              <Button variant="secondary" onClick={onHome}>
                처음으로 갈게요
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
