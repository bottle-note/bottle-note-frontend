'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  isProgramDetailItem,
  isRecommendedWhiskyDetailItem,
  isTastingEventFeedItem,
  isWhiskyPairingDetailItem,
} from '@/api/curation-v2/guards';
import type {
  RecommendedWhiskyDetailItem,
  TastingEventDetailItem,
} from '@/api/curation-v2/types';
import Button from '@/components/ui/Button/Button';
import BaseImage from '@/components/ui/Display/BaseImage';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/Display/carousel';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';
import List from '@/components/feature/List/List';
import { useCurationDetailQuery } from '@/queries/useCurationDetailQuery';
import { isBeforeToday } from '@/utils/formatDate';
import { TastingEventInfoCard } from '@/app/(primary)/curation/_components/TastingEventInfoCard';
import { TastingEventLineupItem } from '@/app/(primary)/curation/_components/TastingEventLineupItem';
import { CurationDetailHeader } from '@/app/(primary)/curation/_components/CurationDetailHeader';
import { parseTastingEventPayload } from '@/app/(primary)/curation/_utils/parseTastingEventPayload';
import { ProgramDetail } from './_components/ProgramDetail';
import { WhiskyPairingDetail } from './_components/WhiskyPairingDetail';

function TastingEventDetail({ event }: { event: TastingEventDetailItem }) {
  const router = useRouter();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { payload } = event;
  const tastingEvent = parseTastingEventPayload(payload);
  const imageUrls = event.imageUrls.filter(
    (url) => url !== event.coverImageUrl,
  );
  const alcohols = payload.alcohols ?? [];
  const applicationLink = payload.applicationLink.trim();
  const isEventPast = isBeforeToday(payload.eventDate);
  const shouldShowCta = Boolean(applicationLink);
  const canApply = shouldShowCta && payload.isRecruiting && !isEventPast;
  const summaryItems = [
    tastingEvent.eventDateLabel,
    tastingEvent.placeLabel,
    tastingEvent.capacityLabel,
  ].filter(Boolean);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const handleSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    handleSelect();
    carouselApi.on('select', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi]);

  return (
    <div
      className={`min-h-safe-screen bg-bg-layer-default text-fg-neutral ${
        shouldShowCta ? 'pb-[var(--sticky-cta-space)]' : 'pb-8'
      }`}
    >
      <CurationDetailHeader title={event.name} onBack={() => router.back()} />

      {/* 상단 */}
      <section className="relative h-60 w-full overflow-hidden bg-bg-neutral-weak">
        <BaseImage
          src={event.coverImageUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 468px) 100vw, 468px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/70" />
        <div className="absolute bottom-5 left-5 right-5">
          <span className="inline-flex rounded-full bg-white/70 px-2.5 py-1 text-10 font-bold text-palette-static-black backdrop-blur-sm">
            시음회
          </span>
          <h1 className="mt-3 line-clamp-2 text-20 font-extrabold text-white">
            {event.name}
          </h1>
          <p className="mt-2 line-clamp-1 text-13 font-light text-white">
            {summaryItems.join(' · ')}
          </p>
        </div>
      </section>

      {/* 시음회 정보 카드 */}
      <section className="px-5 py-5">
        <TastingEventInfoCard
          payload={payload}
          showMapCta
          textBehavior="wrap"
          className="bg-bg-neutral-weak"
        />
      </section>

      {/* 시음회 설명 */}
      <section className="px-5">
        <p className="whitespace-pre-line text-13 font-medium text-fg-neutral">
          {event.description}
        </p>
      </section>

      {/* 이미지 캐러셀 */}
      {imageUrls.length > 0 && (
        <section className="mt-5 w-full">
          <Carousel
            setApi={setCarouselApi}
            opts={{ align: 'start', loop: imageUrls.length > 1 }}
            className="w-full bg-bg-neutral-weak"
          >
            <CarouselContent className="!ml-0">
              {imageUrls.map((url, index) => (
                <CarouselItem key={url} className="!pl-0">
                  <div className="relative h-60 w-full overflow-hidden bg-bg-neutral-weak">
                    <BaseImage
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 468px) 100vw, 468px"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {imageUrls.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {imageUrls.map((url, index) => (
                  <span
                    key={url}
                    className={`h-1.5 w-1.5 rounded-full ${
                      currentSlide === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </section>
      )}

      {/* 시음회 라인업 */}
      {alcohols.length > 0 && (
        <section className="px-5 py-6">
          <h2 className="text-16 font-extrabold text-fg-neutral">
            시음회 라인업
          </h2>
          <List>
            <List.Section className="mt-4 divide-y divide-stroke-neutral-basement border-t border-stroke-neutral-basement">
              {alcohols.map((item, index) => (
                <TastingEventLineupItem
                  key={
                    item.alcohol.alcoholId != null
                      ? `alcohol-${item.alcohol.alcoholId}`
                      : `manual-${item.alcohol.korName}-${item.alcohol.engName ?? ''}`
                  }
                  item={item}
                  order={index + 1}
                />
              ))}
            </List.Section>
          </List>
        </section>
      )}

      {shouldShowCta && (
        <div
          className="fixed-content z-20 px-5"
          style={{ bottom: 'var(--navbar-margin-bottom)' }}
        >
          {canApply ? (
            <a
              href={applicationLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-bg-brand-solid active:bg-bg-brand-solid-pressed"
            >
              <span className="text-15 font-bold text-fg-brand-contrast">
                시음회 신청하기
              </span>
            </a>
          ) : (
            <Button btnName="모집 마감" onClick={() => undefined} disabled />
          )}
        </div>
      )}
    </div>
  );
}

function CurationDetail({
  curation,
}: {
  curation: RecommendedWhiskyDetailItem;
}) {
  const router = useRouter();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const imageUrls = curation.imageUrls.filter(
    (url) => url !== curation.coverImageUrl,
  );
  const label = curation.spec?.name ?? '큐레이션';

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const handleSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    handleSelect();
    carouselApi.on('select', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi]);

  return (
    <div className="min-h-safe-screen bg-bg-layer-default pb-8 text-fg-neutral">
      <CurationDetailHeader
        title={curation.name}
        onBack={() => router.back()}
      />

      <section className="relative h-60 w-full overflow-hidden bg-bg-neutral-weak">
        <BaseImage
          src={curation.coverImageUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 468px) 100vw, 468px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />
        <div className="absolute bottom-5 left-5 right-5">
          <span className="inline-flex rounded-full bg-white/70 px-2.5 py-1 text-10 font-bold text-palette-static-black backdrop-blur-sm">
            {label}
          </span>
          <h1 className="mt-3 line-clamp-2 text-20 font-extrabold text-white">
            {curation.name}
          </h1>
        </div>
      </section>

      <section className="px-5 py-5">
        <p className="whitespace-pre-line text-13 font-medium text-fg-neutral">
          {curation.description}
        </p>
      </section>

      {imageUrls.length > 0 && (
        <section className="w-full">
          <Carousel
            setApi={setCarouselApi}
            opts={{ align: 'start', loop: imageUrls.length > 1 }}
            className="w-full bg-bg-neutral-weak"
          >
            <CarouselContent className="!ml-0">
              {imageUrls.map((url, index) => (
                <CarouselItem key={url} className="!pl-0">
                  <div className="relative h-60 w-full overflow-hidden bg-bg-neutral-weak">
                    <BaseImage
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 468px) 100vw, 468px"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {imageUrls.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {imageUrls.map((url, index) => (
                  <span
                    key={url}
                    className={`h-1.5 w-1.5 rounded-full ${
                      currentSlide === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </section>
      )}

      {curation.payload.length > 0 && (
        <section className="px-5 py-6">
          <h2 className="text-16 font-extrabold text-fg-neutral">
            추천 라인업
          </h2>
          <List>
            <List.Section className="mt-4 divide-y divide-stroke-neutral-basement border-t border-stroke-neutral-basement">
              {curation.payload.map((item, index) => (
                <TastingEventLineupItem
                  key={
                    item.alcohol.alcoholId != null
                      ? `alcohol-${item.alcohol.alcoholId}`
                      : `manual-${item.alcohol.korName}-${item.alcohol.engName ?? ''}`
                  }
                  item={item}
                  order={index + 1}
                />
              ))}
            </List.Section>
          </List>
        </section>
      )}
    </div>
  );
}

function CurationDetailSkeleton() {
  return (
    <div className="min-h-safe-screen bg-bg-layer-default pb-28">
      <CurationDetailHeader title="큐레이션" />
      <div className="h-60 bg-bg-neutral-weak" />
      <div className="px-5 py-5">
        <div className="h-56 rounded-xl bg-bg-neutral-weak" />
        <div className="mt-5 h-20 rounded-md bg-bg-neutral-weak" />
        <div className="mt-5 h-60 rounded-xl bg-bg-neutral-weak" />
      </div>
    </div>
  );
}

export default function CurationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCurationDetailQuery(
    params.id,
  );

  if (isLoading) {
    return <CurationDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <ErrorFallback
        message="큐레이션 정보를 불러오지 못했습니다."
        onBack={() => router.back()}
        onRetry={() => refetch()}
      />
    );
  }

  if (isTastingEventFeedItem(data)) {
    return <TastingEventDetail event={data} />;
  }

  if (isProgramDetailItem(data)) {
    return <ProgramDetail program={data} />;
  }

  if (isWhiskyPairingDetailItem(data)) {
    return <WhiskyPairingDetail pairing={data} />;
  }

  if (isRecommendedWhiskyDetailItem(data)) {
    return <CurationDetail curation={data} />;
  }

  return (
    <ErrorFallback
      message="지원하지 않는 큐레이션입니다."
      onBack={() => router.back()}
      onRetry={() => refetch()}
    />
  );
}
