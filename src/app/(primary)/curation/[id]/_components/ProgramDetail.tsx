'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { ProgramDetailItem } from '@/api/curation-v2/types';
import BaseImage from '@/components/ui/Display/BaseImage';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/Display/carousel';
import { CurationDetailHeader } from '@/app/(primary)/curation/_components/CurationDetailHeader';
import { ProgramEventInfoCard } from '@/app/(primary)/curation/_components/ProgramEventInfoCard';
import { ProgramScheduleItem } from '@/app/(primary)/curation/_components/ProgramScheduleItem';
import { getProgramSummary } from '@/app/(primary)/curation/_utils/parseProgramPayload';

interface ProgramDetailProps {
  program: ProgramDetailItem;
}

export function ProgramDetail({ program }: ProgramDetailProps) {
  const router = useRouter();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { payload } = program;
  const { dateLabel, entryFeeLabel, tagLabels } = getProgramSummary(payload);
  const imageUrls = program.imageUrls.filter(
    (url) => url !== program.coverImageUrl,
  );
  const registrationUrl = payload.registrationUrl?.trim();
  const officialUrl = payload.officialUrl?.trim();

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
        registrationUrl ? 'pb-[var(--sticky-cta-space)]' : 'pb-8'
      }`}
    >
      <CurationDetailHeader title={program.name} onBack={() => router.back()} />

      <section className="relative h-60 w-full overflow-hidden bg-bg-neutral-weak">
        <BaseImage
          src={program.coverImageUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 468px) 100vw, 468px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <span className="inline-flex rounded-full bg-white/70 px-2.5 py-1 text-10 font-bold text-palette-static-black backdrop-blur-sm">
            프로그램
          </span>
          <h1 className="mt-3 line-clamp-2 text-20 font-extrabold">
            {program.name}
          </h1>
          <p className="mt-2 line-clamp-1 text-13 font-light">
            {dateLabel} · {payload.placeName} · {entryFeeLabel}
          </p>
        </div>
      </section>

      <section className="px-5 py-5">
        <ProgramEventInfoCard payload={payload} />
      </section>

      <section className="px-5">
        <p className="whitespace-pre-line text-13 font-medium leading-[1.7] text-fg-neutral">
          {program.description}
        </p>
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex w-full items-center justify-between py-2 text-14 font-bold text-fg-brand"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={16} aria-hidden />
              공식 페이지 보기
            </span>
            <ChevronRight size={16} aria-hidden />
          </a>
        )}
      </section>

      {tagLabels.length > 0 && (
        <section className="px-5 pt-6">
          <h2 className="text-16 font-extrabold text-fg-neutral">행사 태그</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tagLabels.map((tag) => (
              <span
                key={tag}
                className="label-default px-2 py-1 text-11 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {imageUrls.length > 0 && (
        <section className="mt-6 w-full">
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

      {payload.programs.length > 0 && (
        <section className="px-5 py-7">
          <h2 className="text-16 font-extrabold text-fg-neutral">
            프로그램 및 이벤트 라인업
          </h2>
          <div className="mt-4 space-y-4">
            {payload.programs.map((item, index) => (
              <ProgramScheduleItem
                key={`${item.name}-${index}`}
                program={item}
              />
            ))}
          </div>
        </section>
      )}

      {registrationUrl && (
        <div
          className="fixed-content z-20 px-5"
          style={{ bottom: 'var(--navbar-margin-bottom)' }}
        >
          <a
            href={registrationUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-bg-brand-solid active:bg-bg-brand-solid-pressed"
          >
            <span className="text-15 font-bold text-fg-brand-contrast">
              행사 참가 신청
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
