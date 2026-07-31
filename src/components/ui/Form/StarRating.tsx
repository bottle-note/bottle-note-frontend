import { useRef } from 'react';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';

interface BaseStar {
  size?: number;
  outerHeightSize?: number;
  outerWidthSize?: number;
  rate: number;
  handleRate: (rate: number) => void;
}

interface StarProps extends BaseStar {
  index: number;
}

const Star = ({
  size = 30,
  outerHeightSize = 54,
  outerWidthSize = 52,
  index,
  rate,
  handleRate,
}: StarProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // TODO: + 마우스 무브, 터치까지 대응되도록 수정
  const handleAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const { width } = rect;

      if (x < width / 3) {
        handleRate(index - 1);
      } else if (x < (2 * width) / 3) {
        handleRate(index - 0.5);
      } else {
        handleRate(index);
      }
    }
  };

  const isFilled = rate >= index;
  const isHalfFilled = rate === index - 0.5;
  const iconSrc = isFilled
    ? '/icon/star-filled-subcoral.svg'
    : isHalfFilled
      ? '/icon/star-half-subcoral.svg'
      : '/icon/star-outlined-subcoral.svg';

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: `${outerWidthSize}px`, height: `${outerHeightSize}px` }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="relative text-fg-rating"
        style={{ width: `${size}px`, height: `${size}px` }}
        onClick={handleAction}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleRate(index);
          }
        }}
        aria-label={`${index}점`}
      >
        <SemanticIcon src={iconSrc} width={size} height={size} />
      </button>
    </div>
  );
};

const StarRating = ({
  size = 30,
  rate,
  outerHeightSize,
  outerWidthSize,
  handleRate,
}: BaseStar) => {
  const maxRating = 10;

  return (
    <div className="relative w-full h-full">
      <div className="flex">
        {Array.from({ length: maxRating / 2 }, (_, i) => (
          <Star
            key={i}
            size={size}
            index={i + 1}
            rate={rate}
            outerHeightSize={outerHeightSize}
            outerWidthSize={outerWidthSize}
            handleRate={handleRate}
          />
        ))}
      </div>
    </div>
  );
};

export default StarRating;
