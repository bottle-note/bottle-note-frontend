import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { FlowAction, FlowLink } from './FlowControls';
import { WhiskeyImage } from './WhiskeyRow';
import type { Whiskey } from '../_data/demo';

/** 고른 술의 정보와 찜·리뷰·자세히 보기. */
export default function WhiskeyDetail({
  whiskey,
  isPicked,
  isTogglingPick,
  onTogglePick,
  onWriteReview,
  onBack,
  onLeave,
}: {
  whiskey: Whiskey;
  isPicked: boolean;
  isTogglingPick: boolean;
  onTogglePick: () => void;
  onWriteReview: () => void;
  onBack: () => void;
  /** 실제 술 상세 페이지로 나가기 직전에 부른다. */
  onLeave: () => void;
}) {
  const [showAllTags, setShowAllTags] = useState(false);
  const action = (
    label: string,
    onClick: () => void,
    primary = false,
    disabled = false,
  ) => (
    <FlowAction onClick={onClick} primary={primary} disabled={disabled}>
      {label}
    </FlowAction>
  );
  return (
    <>
      <div className="rounded-xl bg-bg-neutral-weak p-14">
        <div className="flex items-center gap-12">
          <WhiskeyImage whiskey={whiskey} size={64} />
          <h1 className="text-18 font-extrabold leading-24">{whiskey.name}</h1>
        </div>
        <dl className="my-14 grid grid-cols-[78px_1fr] gap-y-6 text-13">
          <dt className="text-fg-neutral-muted">종류·도수</dt>
          <dd>
            {whiskey.category} · {whiskey.region} · {whiskey.abv}%
          </dd>
          <dt className="text-fg-neutral-muted">유저평균</dt>
          <dd className={whiskey.rating === null ? '' : 'text-fg-rating'}>
            {whiskey.rating === null
              ? '평가 없음'
              : `★ ${whiskey.rating.toFixed(1)}${whiskey.ratingCount ? ` · 평가 ${whiskey.ratingCount}건` : ''}${whiskey.reviewCount ? ` · 리뷰 ${whiskey.reviewCount}건` : ''}`}
          </dd>
          <dt className="text-fg-neutral-muted">대략 가격</dt>
          <dd>
            {whiskey.glassPrice
              ? `한 잔 ${whiskey.glassPrice.toLocaleString()}원`
              : '정보 없음'}{' '}
            ·{' '}
            {whiskey.bottlePrice
              ? `한 병 ${whiskey.bottlePrice.toLocaleString()}원`
              : '정보 없음'}
          </dd>
        </dl>
        <div className="flex flex-wrap gap-5">
          {whiskey.tags.slice(0, showAllTags ? undefined : 8).map((tag) => (
            <span
              key={tag}
              className="rounded bg-bg-brand-weak px-7 py-4 text-11 leading-15 text-fg-brand"
            >
              {tag}
            </span>
          ))}
          {whiskey.tags.length > 8 && (
            <button
              type="button"
              className="text-13 font-bold text-fg-brand"
              onClick={() => setShowAllTags(!showAllTags)}
            >
              {showAllTags ? '접기' : `${whiskey.tags.length - 8}개 더보기`}
            </button>
          )}
        </div>
        {whiskey.glassPrice && (
          <p className="mb-0 text-12 text-fg-neutral-muted">
            바 한 잔 가격은 매장마다 다를 수 있어요.
          </p>
        )}
      </div>
      <FlowLink
        primary
        href={ROUTES.ALCOHOL.DETAIL(whiskey.id)}
        onClick={onLeave}
      >
        자세히 볼게요
      </FlowLink>
      <div className="grid grid-cols-2 gap-6">
        {action(
          isPicked ? '♥ 찜했어요' : '♡ 찜해둘게요',
          onTogglePick,
          false,
          isTogglingPick,
        )}
        {action('리뷰 작성', onWriteReview)}
      </div>
      {action('‹ 후보 목록으로', onBack)}
    </>
  );
}
