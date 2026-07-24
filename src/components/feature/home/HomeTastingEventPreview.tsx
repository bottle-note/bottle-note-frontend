'use client';

import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import { useTastingEventsQuery } from '@/queries/useTastingEventsQuery';
import { HomeFeaturedErrorState } from '@/components/feature/home/_components/HomeFeaturedErrorState';
import {
  HomeTastingEventMoreCard,
  HomeTastingEventPreviewCard,
} from '@/components/feature/home/_components/HomeTastingEventPreviewCard';

function HomeTastingEventSkeleton() {
  return (
    <div className="flex h-[321px] gap-4 overflow-hidden">
      <div className="h-[312px] w-[272px] shrink-0 animate-pulse rounded-lg bg-sectionWhite dark:bg-bn-raised" />
      <div className="h-[312px] w-[272px] shrink-0 animate-pulse rounded-lg bg-sectionWhite dark:bg-bn-raised" />
    </div>
  );
}

function HomeTastingEventEmptyState() {
  return (
    <div className="flex h-[312px] w-[272px] flex-col justify-center rounded-lg bg-sectionWhite dark:bg-bn-raised px-5">
      <p className="text-14 font-bold text-mainDarkGray dark:text-bn-text">
        진행 중인 시음회가 없어요.
      </p>
      <p className="mt-2 text-11 font-medium leading-[17px] text-mainGray dark:text-bn-text-secondary">
        새로운 시음회가 등록되면 이곳에서 확인할 수 있어요.
      </p>
    </div>
  );
}

export default function HomeTastingEventPreview() {
  const {
    data: tastingEvents,
    isLoading,
    error,
    refetch,
  } = useTastingEventsQuery(
    3,
    undefined,
    CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
  );

  if (isLoading) {
    return <HomeTastingEventSkeleton />;
  }

  if (error) {
    return (
      <div className="h-[321px] pr-[25px]">
        <HomeFeaturedErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="h-[321px] overflow-x-auto scrollbar-hide">
      <div className="flex gap-4">
        {tastingEvents && tastingEvents.length > 0 ? (
          tastingEvents.map((event, index) => (
            <div key={event.id} className="shrink-0">
              <HomeTastingEventPreviewCard
                event={event}
                priority={index === 0}
              />
            </div>
          ))
        ) : (
          <div className="shrink-0">
            <HomeTastingEventEmptyState />
          </div>
        )}

        <div className="shrink-0 pr-[25px]">
          <HomeTastingEventMoreCard />
        </div>
      </div>
    </div>
  );
}
