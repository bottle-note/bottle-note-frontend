'use client';

import { type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CalendarDays,
  ChevronLeft,
  MapPin,
  Search,
  Share2,
  Star,
  Users,
} from 'lucide-react';
import { isTastingEventFeedItem } from '@/api/curation-v2/guards';
import type {
  TastingEventAlcohol,
  TastingEventDetailItem,
} from '@/api/curation-v2/types';
import Button from '@/components/ui/Button/Button';
import BaseImage from '@/components/ui/Display/BaseImage';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';
import { useCurationDetailQuery } from '@/queries/useCurationDetailQuery';

function DetailHeader({
  title,
  onBack,
  onShare,
}: {
  title: string;
  onBack: () => void;
  onShare: () => Promise<void> | void;
}) {
  return (
    <header className="sticky top-0 z-20 bg-white px-5 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-mainDarkGray"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-sectionWhite px-4 py-2 text-mainDarkGray">
          <Search size={16} strokeWidth={2} className="shrink-0" />
          <span className="truncate text-13 font-bold">{title}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            void onShare();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-mainDarkGray"
          aria-label="공유하기"
        >
          <Share2 size={20} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}

function HeroSection({ event }: { event: TastingEventDetailItem }) {
  const { payload } = event;
  const eventDate = new Date(payload.eventDate);
  const eventDateLabel = Number.isNaN(eventDate.getTime())
    ? payload.eventDate
    : `${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일 (${
        ['일', '월', '화', '수', '목', '금', '토'][eventDate.getDay()]
      })`;

  return (
    <section className="relative h-60 w-full overflow-hidden bg-sectionWhite">
      <BaseImage
        src={event.coverImageUrl}
        alt=""
        fill
        priority
        sizes="(max-width: 468px) 100vw, 468px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/70" />
      <div className="absolute bottom-5 left-5 right-5 text-white">
        <span className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-10 font-bold backdrop-blur-sm">
          시음회
        </span>
        <h1 className="mt-3 line-clamp-2 text-20 font-extrabold">
          {event.name}
        </h1>
        <p className="mt-2 line-clamp-1 text-12 font-semibold">
          {eventDateLabel} · {payload.placeName ?? payload.barAddress} · 정원{' '}
          {payload.capacity.toLocaleString('ko-KR')}명
        </p>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-mainDarkGray">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 flex-1 text-13 font-extrabold text-mainDarkGray">
            {title}
          </p>
          {action}
        </div>
        {description && (
          <p className="mt-1 text-11 font-medium text-mainGray">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function EventInfoCard({ event }: { event: TastingEventDetailItem }) {
  const { payload } = event;
  const fullAddress = [payload.barAddress, payload.detailAddress]
    .filter(Boolean)
    .join(' ');
  const eventDate = new Date(payload.eventDate);
  const eventDateLabel = Number.isNaN(eventDate.getTime())
    ? payload.eventDate
    : `${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일 (${
        ['일', '월', '화', '수', '목', '금', '토'][eventDate.getDay()]
      })`;
  const [hour, minute] = payload.eventTime.split(':');
  const eventTimeLabel =
    hour && minute ? `${hour}:${minute}` : payload.eventTime;
  const entryFeeLabel =
    payload.entryFee > 0
      ? `${payload.entryFee.toLocaleString('ko-KR')}원`
      : '무료';

  return (
    <section className="px-5 py-5">
      <div className="rounded-xl bg-sectionWhite px-4 py-5">
        <span className="inline-flex rounded-full bg-mainCoral px-2.5 py-1 text-10 font-bold text-white">
          시음회 정보
        </span>

        <div className="mt-5 flex flex-col gap-5">
          <InfoRow
            icon={<CalendarDays size={18} strokeWidth={2} />}
            title={`${eventDateLabel} · ${eventTimeLabel}`}
            description={payload.guideText}
          />
          <InfoRow
            icon={<MapPin size={18} strokeWidth={2} />}
            title={payload.placeName ?? payload.barAddress}
            description={fullAddress}
            action={
              fullAddress && (
                <a
                  href={`https://map.naver.com/p/search/${encodeURIComponent(
                    fullAddress,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full bg-white px-2.5 py-1 text-10 font-bold text-mainDarkGray"
                >
                  지도 보기
                </a>
              )
            }
          />
          <InfoRow
            icon={<Users size={18} strokeWidth={2} />}
            title={`${payload.capacity.toLocaleString('ko-KR')}명 정원`}
            description="위스키 네비 멤버십 한정 신청 가능합니다."
          />
          <div className="flex items-end gap-2">
            <span className="text-11 font-bold text-mainDarkGray">참가비</span>
            <span className="text-20 font-black text-mainDarkGray">
              {entryFeeLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DescriptionSection({ event }: { event: TastingEventDetailItem }) {
  const imageUrl = event.imageUrls.find((url) => url !== event.coverImageUrl);

  return (
    <section className="px-5">
      <p className="whitespace-pre-line text-13 font-medium text-mainDarkGray">
        {event.description}
      </p>

      {imageUrl && (
        <div className="mt-5 h-60 overflow-hidden rounded-xl bg-sectionWhite">
          <BaseImage
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 468px) calc(100vw - 40px), 428px"
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}

function AlcoholLineupItem({
  item,
  index,
}: {
  item: TastingEventAlcohol;
  index: number;
}) {
  const { alcohol, stats, comment } = item;
  const chips = [
    ...(alcohol.selectedTags ?? []),
    alcohol.korCategory,
    alcohol.regionName,
  ].filter(Boolean);
  const details = [
    alcohol.abv && `${alcohol.abv}%`,
    alcohol.korCategory,
    alcohol.regionName,
  ].filter(Boolean);

  return (
    <article className="flex gap-3 py-5">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mainDarkGray text-10 font-bold text-white">
        {index + 1}
      </div>

      <div className="h-24 w-14 shrink-0 overflow-hidden rounded-md bg-sectionWhite">
        <BaseImage
          src={alcohol.imageUrl ?? ''}
          alt={alcohol.korName}
          fill
          sizes="56px"
          className="object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-13 font-extrabold text-mainDarkGray">
          {alcohol.korName}
        </h3>
        {alcohol.engName && (
          <p className="mt-1 line-clamp-1 text-10 font-medium text-mainGray">
            {alcohol.engName}
          </p>
        )}
        {details.length > 0 && (
          <p className="mt-2 text-10 font-semibold text-mainGray">
            {details.join(' · ')}
          </p>
        )}
        {typeof stats?.rating === 'number' && (
          <div className="mt-2 flex items-center gap-1 text-10 font-bold text-subCoral">
            <Star size={12} fill="currentColor" strokeWidth={0} />
            <span>{stats.rating.toFixed(1)}</span>
          </div>
        )}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.slice(0, 3).map((chip) => (
              <span
                key={chip}
                className="label-default px-2 py-1 text-9 font-medium"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
        {comment && (
          <p className="mt-3 line-clamp-3 text-12 font-medium text-mainDarkGray">
            {comment}
          </p>
        )}
      </div>
    </article>
  );
}

function LineupSection({ event }: { event: TastingEventDetailItem }) {
  const alcohols = event.payload.alcohols ?? [];

  if (alcohols.length === 0) {
    return null;
  }

  return (
    <section className="px-5 py-6">
      <h2 className="text-16 font-extrabold text-mainDarkGray">
        시음회 라인업
      </h2>
      <div className="mt-4 divide-y divide-bgGray border-t border-bgGray">
        {alcohols.map((item, index) => (
          <AlcoholLineupItem
            key={item.source ?? item.alcohol.alcoholId ?? item.alcohol.korName}
            item={item}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function TastingEventDetail({ event }: { event: TastingEventDetailItem }) {
  const router = useRouter();
  const { payload } = event;
  const canApply = payload.isRecruiting && Boolean(payload.applicationLink);
  let applyButtonText = '시음회 신청하기';

  if (!payload.isRecruiting) {
    applyButtonText = '모집 마감';
  } else if (!payload.applicationLink) {
    applyButtonText = '신청 준비 중';
  }

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: event.name,
        text: event.description,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
  };

  const handleApply = () => {
    if (!payload.applicationLink) {
      return;
    }

    window.open(payload.applicationLink, '_blank', 'noreferrer');
  };

  return (
    <div className="min-h-safe-screen bg-white pb-28">
      <DetailHeader
        title={event.name}
        onBack={() => router.back()}
        onShare={handleShare}
      />
      <HeroSection event={event} />
      <EventInfoCard event={event} />
      <DescriptionSection event={event} />
      <LineupSection event={event} />
      <div className="px-5">
        <Button
          btnName={applyButtonText}
          onClick={handleApply}
          btnStyles="bg-subCoral"
          disabled={!canApply}
        />
      </div>
    </div>
  );
}

function TastingEventDetailSkeleton() {
  return (
    <div className="min-h-safe-screen bg-white pb-28">
      <div className="px-5 py-3">
        <div className="h-8 rounded-full bg-sectionWhite" />
      </div>
      <div className="h-60 bg-sectionWhite" />
      <div className="px-5 py-5">
        <div className="h-56 rounded-xl bg-sectionWhite" />
        <div className="mt-5 h-20 rounded-md bg-sectionWhite" />
        <div className="mt-5 h-60 rounded-xl bg-sectionWhite" />
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
    return <TastingEventDetailSkeleton />;
  }

  if (isError || !data || !isTastingEventFeedItem(data)) {
    return (
      <ErrorFallback
        message="시음회 정보를 불러오지 못했습니다."
        onBack={() => router.back()}
        onRetry={() => refetch()}
      />
    );
  }

  return <TastingEventDetail event={data} />;
}
