'use client';

import { useRouter } from 'next/navigation';
import type { WhiskyPairingDetailItem } from '@/api/curation-v2/types';
import BaseImage from '@/components/ui/Display/BaseImage';
import { CurationDetailHeader } from '@/app/(primary)/curation/_components/CurationDetailHeader';
import { TastingEventLineupItem } from '@/app/(primary)/curation/_components/TastingEventLineupItem';
import { WhiskyPairingFoodList } from '@/app/(primary)/curation/_components/WhiskyPairingFoodList';

interface WhiskyPairingDetailProps {
  pairing: WhiskyPairingDetailItem;
}

export function WhiskyPairingDetail({ pairing }: WhiskyPairingDetailProps) {
  const router = useRouter();
  const pairingFoods = pairing.payload.flatMap((item) => item.pairings);

  return (
    <div className="min-h-safe-screen bg-bg-layer-default pb-8 text-fg-neutral">
      <CurationDetailHeader title={pairing.name} onBack={() => router.back()} />

      <section className="relative h-60 w-full overflow-hidden bg-bg-neutral-weak">
        <BaseImage
          src={pairing.coverImageUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 468px) 100vw, 468px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#5F3826]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/75" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <span className="inline-flex rounded-full bg-bg-brand-solid px-2.5 py-1 text-10 font-bold text-fg-brand-contrast">
            페어링
          </span>
          <h1 className="mt-3 line-clamp-2 text-20 font-extrabold">
            {pairing.name}
          </h1>
          <p className="mt-2 text-13 font-light text-white/85">
            페어링 {pairingFoods.length}종 추천
          </p>
        </div>
      </section>

      <section className="px-5 py-5">
        <p className="whitespace-pre-line text-13 font-medium leading-[1.7] text-fg-neutral-muted">
          {pairing.description}
        </p>
      </section>

      {pairing.payload.length > 0 && (
        <section className="px-5 py-7">
          <h2 className="text-16 font-extrabold text-fg-neutral">
            페어링 라인업
          </h2>
          <div className="mt-4 space-y-7">
            {pairing.payload.map((item, index) => (
              <div
                key={
                  item.alcohol.alcoholId != null
                    ? `alcohol-${item.alcohol.alcoholId}`
                    : `manual-${item.alcohol.korName}-${index}`
                }
              >
                <TastingEventLineupItem item={item} order={index + 1} />
                <WhiskyPairingFoodList pairings={item.pairings} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
