import styles from './RatingScorePop.module.css';

interface RatingScorePopProps {
  rating: number;
  unit?: string;
  delayMs?: number;
  className?: string;
}

export default function RatingScorePop({
  rating,
  unit = '',
  delayMs = 0,
  className = '',
}: RatingScorePopProps) {
  return (
    <p
      key={rating}
      className={`${styles.pop} ${className}`}
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {rating.toFixed(1)}
      {unit}
    </p>
  );
}
