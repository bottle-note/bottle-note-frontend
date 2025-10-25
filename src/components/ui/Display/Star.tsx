import Image from 'next/image';

interface Props {
  rating: number;
  size?: number;
  textStyle?: string;
  color?: 'main' | 'white';
  align?: 'center' | 'end';
}

const Star = ({
  rating,
  size = 18,
  textStyle = 'text-subCoral font-semibold text-15 min-w-5',
  color = 'main',
  align = 'center',
}: Props) => {
  const hasRating = rating && rating > 0;

  return (
    <div
      className={`inline-flex items-${hasRating && align === 'end' ? 'end' : 'center'}`}
    >
      <div className="relative flex-shrink-0">
        {color === 'main' ? (
          <Image
            src="/icon/star-filled-subcoral.svg"
            width={size}
            height={size}
            alt="star"
            style={{ width: size, height: size }}
          />
        ) : (
          <Image
            src="/icon/star-filled-white.svg"
            width={size}
            height={size}
            alt="star"
            style={{ width: size, height: size }}
          />
        )}
      </div>
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
