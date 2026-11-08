'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import AlcoholItem from '@/components/feature/home/AlcoholItem';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { useSimilarAlcohols } from '@/queries/useSimilarAlcohols';
import type { Alcohol } from '@/api/alcohol/types';
import type { ExploreAlcohol } from '@/api/explore/types';
import { similarEntryHref } from '@/app/(custom)/bartender-note/_components/similarEntry';

/** 둘러보기 응답을 홈 카드(AlcoholItem)가 받는 모양으로 바꾼다. */
const toAlcoholItem = (item: ExploreAlcohol): Alcohol => ({
  alcoholId: item.alcoholId,
  korName: item.korName,
  engName: item.engName,
  rating: item.rating,
  ratingCount: item.totalRatingsCount,
  korCategory: item.korCategory,
  engCategory: item.engCategory,
  imageUrl: item.alcoholUrlImg,
  isPicked: item.isPicked,
});

interface Props {
  alcoholId: number;
  alcoholName: string;
  tags: string[];
  showBottomBorder: boolean;
}

export default function SimilarAlcoholsSection({
  alcoholId,
  alcoholName,
  tags,
  showBottomBorder,
}: Props) {
  const { data, isPending, isError } = useSimilarAlcohols(alcoholId, tags);
  const keyword = tags.join(' ');
  const hasTags = tags.length > 0;
  // 요청이 실패하면 목록 자리만 비운다. 상세 본문과 바텐더 진입은 그대로 둔다.
  const showList = hasTags && !isError;

  return (
    <section
      aria-label="비슷한 위스키 추천"
      className={`pb-20 ${showBottomBorder ? 'border-b border-stroke-neutral-subtle' : ''}`}
    >
      {showList && (
        <>
          <div className="mx-20 flex items-center justify-between">
            <h2 className="text-16 font-bold text-fg-neutral">
              비슷한 위스키 추천
            </h2>
            <Link
              href={ROUTES.EXPLORE.WHISKEY_SEARCH(keyword)}
              onClick={() =>
                trackGA4Event('similar_alcohol_more_click', {
                  alcohol_id: String(alcoholId),
                })
              }
              className="flex min-h-32 items-center gap-2 text-12 font-medium text-fg-neutral-muted"
            >
              더 보기
              <ChevronRight aria-hidden className="h-14 w-14" />
            </Link>
          </div>
          <div className="mt-12">
            {isPending ? (
              <div
                aria-hidden="true"
                className="flex gap-8 overflow-hidden px-20"
              >
                {[0, 1, 2].map((index) => (
                  <SkeletonBase
                    key={index}
                    width={145}
                    height={225}
                    borderRadius="8px"
                  />
                ))}
              </div>
            ) : data && data.length > 0 ? (
              <ul className="m-0 flex list-none gap-8 overflow-x-auto px-20 py-0 scrollbar-hide">
                {data.map((alcohol, index) => (
                  <li
                    key={alcohol.alcoholId}
                    className="flex-shrink-0"
                    onClickCapture={() =>
                      trackGA4Event('similar_alcohol_click', {
                        alcohol_id: String(alcoholId),
                        target_alcohol_id: String(alcohol.alcoholId),
                        position: index + 1,
                      })
                    }
                  >
                    <AlcoholItem data={toAlcoholItem(alcohol)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mx-20 py-24 text-center text-15 text-fg-neutral">
                비슷한 위스키를 찾지 못했어요
              </p>
            )}
          </div>
        </>
      )}
      <Link
        href={similarEntryHref({ alcoholId, name: alcoholName, tags })}
        onClick={() =>
          trackGA4Event('bartender_entry_click', {
            entry_source: 'alcohol_detail',
          })
        }
        className={`mx-20 flex min-h-64 items-center gap-12 rounded-xl border border-stroke-neutral-basement bg-bg-neutral-weak py-10 pl-10 pr-12 text-fg-neutral ${
          showList ? 'mt-16' : 'mt-20'
        }`}
      >
        <Image
          src="/images/bartender-note/note-avatar.webp"
          alt=""
          width={44}
          height={44}
          className="h-44 w-44 shrink-0 rounded-full"
        />
        <span className="flex-1 text-14 font-bold">
          바텐더 노트에게 다양한 위스키 추천받기
        </span>
        <ChevronRight
          aria-hidden
          className="h-18 w-18 shrink-0 text-fg-neutral-muted"
        />
      </Link>
    </section>
  );
}
