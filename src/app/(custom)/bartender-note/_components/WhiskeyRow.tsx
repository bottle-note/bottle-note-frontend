import type { Whiskey } from '../_data/demo';

const imageSizeClasses: Record<number, string> = {
  40: 'h-40 w-40',
  44: 'h-44 w-44',
  64: 'h-64 w-64',
};

export function WhiskeyImage({
  whiskey,
  size = 44,
}: {
  whiskey: Whiskey;
  size?: number;
}) {
  const imageIndex = [
    140, 8872, 9146, 6273, 463, 127, 604, 77, 4927, 466, 5859, 464, 9101, 9103,
    8840, 224, 5588, 567, 6330, 462, 318, 8200, 575, 551, 411, 336, 592, 5405,
    254, 125, 8323, 542, 5892, 8040, 7997,
  ].indexOf(whiskey.id);
  return (
    <span
      className={`relative block shrink-0 rounded-md bg-palette-static-white bg-no-repeat ${imageSizeClasses[size] ?? 'h-44 w-44'} ${imageIndex < 0 ? 'bg-stroke-neutral-subtle after:absolute after:left-[40%] after:top-[18%] after:h-[64%] after:w-[20%] after:rounded-b after:bg-stroke-neutral-weak' : "bg-[url('/images/bartender-note/bottle-sheet.webp')]"}`}
      style={
        imageIndex < 0
          ? undefined
          : {
              backgroundSize: `${size * 7}px ${size * 5}px`,
              backgroundPosition: `${-(imageIndex % 7) * size}px ${-Math.floor(imageIndex / 7) * size}px`,
            }
      }
      aria-hidden="true"
    />
  );
}

export function WhiskeyRow({
  whiskey,
  rank,
  onClick,
  hit = [],
  miss = [],
  showPrice = false,
  priceUnit = 'glass',
  search = false,
}: {
  whiskey: Whiskey;
  rank?: number;
  onClick: () => void;
  hit?: string[];
  miss?: string[];
  showPrice?: boolean;
  priceUnit?: 'glass' | 'bottle';
  search?: boolean;
}) {
  return (
    <button
      className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
      type="button"
      onClick={onClick}
    >
      {rank && <b className="w-14 text-13 text-fg-brand">{rank}</b>}
      <WhiskeyImage whiskey={whiskey} />
      <span className="flex min-w-0 flex-1 flex-col gap-3">
        <b className="text-14 font-bold leading-18">{whiskey.name}</b>
        <small className="text-12 leading-16 text-fg-neutral-muted">
          {search ? `${whiskey.category} · ` : ''}
          {whiskey.abv}%
          {showPrice &&
            (priceUnit === 'glass'
              ? whiskey.glassPrice
              : whiskey.bottlePrice) &&
            ` · ${priceUnit === 'glass' ? '한 잔' : '병'} 약 ${(priceUnit === 'glass' ? whiskey.glassPrice : whiskey.bottlePrice)?.toLocaleString()}원`}
          {' · '}
          {whiskey.rating === null ? (
            '평가 없음'
          ) : (
            <span className="text-fg-rating">
              ★ {whiskey.rating.toFixed(1)}
              {whiskey.ratingCount ? ` (${whiskey.ratingCount})` : ''}
            </span>
          )}
        </small>
        {!search && (
          <span className="flex flex-wrap gap-5">
            {[
              ...whiskey.tags.filter((tag) => hit.includes(tag)),
              ...whiskey.tags.filter((tag) => !hit.includes(tag)),
            ]
              .slice(0, 4)
              .map((tag) => (
                <span
                  key={tag}
                  className={
                    hit.includes(tag)
                      ? 'rounded bg-bg-brand-weak px-7 py-4 text-11 leading-15 text-fg-brand'
                      : 'rounded bg-bg-neutral-weak px-7 py-4 text-11 leading-15 text-fg-neutral-muted'
                  }
                >
                  {tag}
                </span>
              ))}
            {miss.map((label) => (
              <span
                key={label}
                className="rounded border border-stroke-neutral-weak px-7 py-4 text-11 leading-15 text-fg-neutral-muted"
              >
                {label}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="text-20 text-fg-neutral-muted" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
