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
    <div className="flex h-321 gap-16 overflow-hidden">
      <div className="h-312 w-272 shrink-0 animate-pulse rounded-lg bg-bg-neutral-weak" />
      <div className="h-312 w-272 shrink-0 animate-pulse rounded-lg bg-bg-neutral-weak" />
    </div>
  );
}

function HomeTastingEventEmptyState() {
  return (
    <div className="flex h-312 w-272 flex-col justify-center rounded-lg bg-bg-neutral-weak px-20">
      <p className="text-14 font-bold text-fg-neutral">
        진행 중인 시음회가 없어요.
      </p>
      <p className="mt-8 text-11 font-medium leading-17 text-fg-neutral-muted">
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
      <div className="h-321 pr-25">
        <HomeFeaturedErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="h-321 overflow-x-auto scrollbar-hide">
      <div className="flex gap-16">
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

        <div className="shrink-0 pr-25">
          <HomeTastingEventMoreCard />
        </div>
      </div>
    </div>
  );
}
