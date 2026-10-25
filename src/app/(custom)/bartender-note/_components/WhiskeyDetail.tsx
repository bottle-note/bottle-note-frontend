import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import Button, { buttonVariants } from '@/components/ui/Button/Button';
import { ROUTES } from '@/constants/routes';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import { FlowDock } from './FlowControls';
import { WhiskeyImage } from './WhiskeyRow';
import type { ReviewAlcohol } from './reviewAlcohol';

/** 고른 술의 정보와 찜·리뷰·자세히 보기. */
export default function WhiskeyDetail({
  alcohol,
  isPicked,
  isTogglingPick,
  onTogglePick,
  onWriteReview,
  onLeave,
}: {
  alcohol: ReviewAlcohol;
  isPicked: boolean;
  isTogglingPick: boolean;
  onTogglePick: () => void;
  onWriteReview: () => void;
  /** 실제 술 상세 페이지로 나가기 직전에 부른다. */
  onLeave: () => void;
}) {
  const [showAllTags, setShowAllTags] = useState(false);
  return (
    <>
      <div className="rounded-xl bg-bg-neutral-weak p-14">
        <div className="flex items-center gap-12">
          {alcohol.demoWhiskey ? (
            <WhiskeyImage whiskey={alcohol.demoWhiskey} size={64} />
          ) : (
            <AlcoholImage
              imageUrl={alcohol.imageUrl ?? ''}
              outerHeightClass="h-64"
              outerWidthClass="w-64"
              innerHeightClass="h-56"
              innerWidthClass="w-36"
            />
          )}
          <h1 className="min-w-0 flex-1 text-18 font-extrabold leading-24">
            {alcohol.name}
          </h1>
          <button
            type="button"
            aria-label={isPicked ? '찜 취소' : '찜하기'}
            aria-pressed={isPicked}
            disabled={isTogglingPick}
            onClick={onTogglePick}
            className="inline-flex min-h-40 shrink-0 items-center gap-4 rounded-md px-6 text-12 font-semibold text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring disabled:opacity-45"
          >
            <Heart
              aria-hidden="true"
              className="h-18 w-18"
              fill={isPicked ? 'currentColor' : 'none'}
            />
            {isPicked ? '찜했어요' : '찜'}
          </button>
        </div>
        <dl className="my-14 grid grid-cols-[78px_1fr] gap-y-6 text-13">
          <dt className="text-fg-neutral-muted">종류·도수</dt>
          <dd>
            {[
              alcohol.category,
              alcohol.region,
              alcohol.abv && `${alcohol.abv}%`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </dd>
          <dt className="text-fg-neutral-muted">유저평균</dt>
          <dd className={alcohol.rating === null ? '' : 'text-fg-rating'}>
            {alcohol.rating === null
              ? '평가 없음'
              : `★ ${alcohol.rating.toFixed(1)}${alcohol.ratingCount ? ` · 평가 ${alcohol.ratingCount}건` : ''}${alcohol.reviewCount ? ` · 리뷰 ${alcohol.reviewCount}건` : ''}`}
          </dd>
          {(alcohol.glassPrice !== undefined ||
            alcohol.bottlePrice !== undefined) && (
            <>
              <dt className="text-fg-neutral-muted">대략 가격</dt>
              <dd>
                {alcohol.glassPrice
                  ? `한 잔 ${alcohol.glassPrice.toLocaleString()}원`
                  : '정보 없음'}{' '}
                ·{' '}
                {alcohol.bottlePrice
                  ? `한 병 ${alcohol.bottlePrice.toLocaleString()}원`
                  : '정보 없음'}
              </dd>
            </>
          )}
        </dl>
        <div className="flex flex-wrap gap-5">
          {alcohol.tags.slice(0, showAllTags ? undefined : 8).map((tag) => (
            <span
              key={tag}
              className="rounded bg-bg-brand-weak px-7 py-4 text-11 leading-15 text-fg-brand"
            >
              {tag}
            </span>
          ))}
          {alcohol.tags.length > 8 && (
            <button
              type="button"
              className="text-13 font-bold text-fg-brand"
              onClick={() => setShowAllTags(!showAllTags)}
            >
              {showAllTags ? '접기' : `${alcohol.tags.length - 8}개 더보기`}
            </button>
          )}
        </div>
        {alcohol.glassPrice && (
          <p className="mb-0 text-12 text-fg-neutral-muted">
            바 한 잔 가격은 매장마다 다를 수 있어요.
          </p>
        )}
      </div>
      <FlowDock>
        <div className="grid grid-cols-2 gap-8">
          <Link
            href={ROUTES.ALCOHOL.DETAIL(alcohol.id)}
            onClick={onLeave}
            className={buttonVariants({
              size: 'lg',
              variant: 'secondary',
              fullWidth: true,
            })}
          >
            자세히 볼게요
          </Link>
          <Button size="lg" variant="primary" onClick={onWriteReview}>
            리뷰 작성
          </Button>
        </div>
      </FlowDock>
    </>
  );
}
