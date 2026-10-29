'use client';

import Link from 'next/link';
import ProfileImage from '@/components/domain/user/ProfileImage';
import Star from '@/components/ui/Display/Star';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import type { ExploreReview } from '@/api/explore/types';
import { REVIEW_EXPLORE_TAB_ID } from '@/app/(primary)/explore/_constants/exploreTabs';
import { ROUTES } from '@/constants/routes';
import { useHomeReviewsQuery } from '@/queries/useHomeReviewsQuery';
import { trackGA4Event } from '@/utils/analytics/ga4';

import HomeSectionHeader from './HomeSectionHeader';
import { HomeFeaturedErrorState } from './_components/HomeFeaturedErrorState';

const SECTION_LABEL = 'REVIEW';
const SECTION_TITLE = '한 잔에 담긴 이야기';
const MAX_TAGS = 3;

/** 인기 리뷰 3개. 비어 있으면 섹션을 숨긴다. */
export default function HomeReviewSection() {
  const { data: reviews, isLoading, isError, refetch } = useHomeReviewsQuery();

  if (!isLoading && !isError && (!reviews || reviews.length === 0)) {
    return null;
  }

  return (
    <section aria-label="인기 리뷰" className="space-y-8">
      <HomeSectionHeader
        label={SECTION_LABEL}
        title={SECTION_TITLE}
        moreHref={`${ROUTES.EXPLORE.BASE}?tab=${REVIEW_EXPLORE_TAB_ID}`}
        moreLabel="리뷰 더 보기"
        onMoreClick={() =>
          trackGA4Event('home_more_click', { section: 'review' })
        }
      />
      {isLoading && (
        <div className="space-y-12 px-20" aria-busy="true">
          <SkeletonBase count={3} height={120} />
        </div>
      )}
      {isError && <HomeFeaturedErrorState onRetry={() => refetch()} />}
      {reviews && reviews.length > 0 && (
        <ul className="px-20">
          {reviews.map((review, index) => (
            <HomeReviewItem
              key={review.reviewId}
              review={review}
              position={index + 1}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface ItemProps {
  review: ExploreReview;
  position: number;
}

function HomeReviewItem({ review, position }: ItemProps) {
  return (
    <li className="border-b border-stroke-neutral-basement">
      <Link
        href={ROUTES.REVIEW.DETAIL(review.reviewId)}
        onClick={() =>
          trackGA4Event('home_item_click', {
            section: 'review',
            item_id: String(review.reviewId),
            position,
          })
        }
        className="flex flex-col gap-8 py-16 text-fg-neutral"
      >
        <span className="flex items-center justify-between gap-8">
          <span className="flex min-w-0 items-center gap-8">
            <ProfileImage
              profileImgSrc={review.userInfo.userProfileImage}
              size={28}
            />
            <span className="truncate text-13 font-bold">
              {review.userInfo.nickName}
            </span>
          </span>
          <Star rating={review.reviewRating} size={14} tone="brand" />
        </span>
        <span className="text-15 font-bold">{review.alcoholName}</span>
        <span className="line-clamp-3 whitespace-pre-line break-words text-14 leading-21">
          {review.reviewContent}
        </span>
        {review.reviewTags.length > 0 && (
          <span className="flex flex-wrap gap-6">
            {review.reviewTags.slice(0, MAX_TAGS).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-stroke-neutral-subtle px-8 py-3 text-12 text-fg-neutral-muted"
              >
                {tag}
              </span>
            ))}
          </span>
        )}
      </Link>
    </li>
  );
}
