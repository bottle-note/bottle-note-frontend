import type { Bottle } from '../_lib/experience';
import styles from '../bartender.module.css';

const IMAGE_IDS = [
  140, 8872, 9146, 6273, 463, 127, 604, 77, 4927, 466, 5859, 464, 9101, 9103,
  8840, 224, 5588, 567, 6330, 462, 318, 8200, 575, 551, 411, 336, 592, 5405,
  254, 125, 8323, 542, 5892, 8040, 7997,
];

export function BottleImage({ id }: { id: number }) {
  const index = IMAGE_IDS.indexOf(id);
  return index >= 0 ? (
    <span
      aria-hidden="true"
      className={styles.bottleImage}
      style={{
        backgroundPosition: `${((index % 7) / 6) * 100}% ${(Math.floor(index / 7) / 4) * 100}%`,
      }}
    />
  ) : (
    <span aria-hidden="true" className={styles.bottlePlaceholder}>
      🥃
    </span>
  );
}

export function BottleSummary({ bottle }: { bottle: Bottle }) {
  return (
    <span className={styles.bottleSummary}>
      <BottleImage id={bottle.id} />
      <span className={styles.bottleInfo}>
        <span className={styles.choiceTitle}>{bottle.name}</span>
        <span className={styles.choiceDescription}>
          {bottle.category} · {bottle.abv}%
        </span>
        <span className={styles.rating}>
          {bottle.rating === null
            ? '아직 평가가 없어요'
            : `★ ${bottle.rating.toFixed(1)} · 평가 ${bottle.ratingCount}개`}
        </span>
      </span>
    </span>
  );
}

export default function BottleCard({
  bottle,
  selected,
  disabled,
  onClick,
}: {
  bottle: Bottle;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.bottleCard}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      <BottleSummary bottle={bottle} />
      {selected && <span className={styles.pickedMark}>선택됨</span>}
    </button>
  );
}
