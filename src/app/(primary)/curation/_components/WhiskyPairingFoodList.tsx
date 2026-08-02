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
    <div className="rounded-xl bg-bg-neutral-weak px-4">
      {pairings.map((food, index) => (
        <article
          key={`${food.itemName}-${food.itemImageUrl ?? index}`}
          className="border-b border-stroke-neutral-basement py-4 last:border-b-0"
        >
          <span className="inline-flex rounded-full bg-bg-brand-weak px-2 py-1 text-10 font-bold text-fg-brand">
            페어링 {index + 1}
          </span>
          <div className="mt-2 flex items-start gap-3">
            <div className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg bg-bg-layer-default">
              <BaseImage
                src={food.itemImageUrl ?? ''}
                alt={food.itemName}
                width={60}
                height={60}
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-13 font-extrabold leading-5 text-fg-neutral">
                {food.itemName}
              </h3>
              <p className="mt-1 whitespace-pre-line break-words text-12 font-medium leading-[1.6] text-fg-neutral-muted">
                {food.pairingNote}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
