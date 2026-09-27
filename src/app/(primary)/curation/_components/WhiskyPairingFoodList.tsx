import type { PairingFood } from '@/api/curation-v2/types';
import BaseImage from '@/components/ui/Display/BaseImage';

interface WhiskyPairingFoodListProps {
  pairings: PairingFood[];
}

export function WhiskyPairingFoodList({
  pairings,
}: WhiskyPairingFoodListProps) {
  if (pairings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-bg-neutral-weak px-16">
      {pairings.map((food, index) => (
        <article
          key={`${food.itemName}-${food.itemImageUrl ?? index}`}
          className="border-b border-stroke-neutral-basement py-16 last:border-b-0"
        >
          <span className="inline-flex rounded-full bg-bg-brand-weak px-8 py-4 text-10 font-bold text-fg-brand">
            페어링 {index + 1}
          </span>
          <div className="mt-8 flex items-start gap-12">
            <div className="h-60 w-60 shrink-0 overflow-hidden rounded-lg bg-palette-static-white">
              <BaseImage
                src={food.itemImageUrl ?? ''}
                alt={food.itemName}
                width={60}
                height={60}
                className="object-cover"
                backgroundClassName="bg-palette-static-white"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-13 font-extrabold leading-20 text-fg-neutral">
                {food.itemName}
              </h3>
              <p className="mt-4 whitespace-pre-line break-words text-12 font-medium leading-[1.6] text-fg-neutral-muted">
                {food.pairingNote}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
