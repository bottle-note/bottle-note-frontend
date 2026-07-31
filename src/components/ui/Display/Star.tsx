import SemanticIcon from './SemanticIcon';

interface Props {
  rating: number;
  size?: number;
  textStyle?: string;
  tone?: 'rating' | 'brandContrast';
  align?: 'center' | 'end';
}

const Star = ({
  rating,
  size = 18,
  textStyle = 'font-semibold text-15 min-w-5',
  tone = 'rating',
  align = 'center',
}: Props) => {
  const hasRating = rating && rating > 0;
  const colorClass =
    tone === 'brandContrast' ? 'text-fg-brand-contrast' : 'text-fg-rating';
  const iconSrc =
    tone === 'brandContrast'
      ? '/icon/star-filled-white.svg'
      : '/icon/star-filled-subcoral.svg';

  return (
    <div
      className={`inline-flex ${colorClass} ${
        hasRating && align === 'end' ? 'items-end' : 'items-center'
      }`}
    >
      <SemanticIcon src={iconSrc} width={size} height={size} />
      <span
        className={`ml-1 ${textStyle}`}
        style={{
          lineHeight: '1',
        }}
      >
        {hasRating ? rating.toFixed(1) : '-'}
      </span>
    </div>
  );
};

export default Star;
