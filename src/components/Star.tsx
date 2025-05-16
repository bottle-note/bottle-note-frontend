import Image from 'next/image';

interface Props {
  rating: number;
  size?: number;
  styleProps?: string;
  color?: 'main' | 'white';
  textTop?: number;
}

const Star = ({
  rating,
  size = 18,
  styleProps = 'text-subCoral font-semibold text-15 w-5',
  color = 'main',
  textTop = 1,
}: Props) => {
  return (
    <div className="inline-flex items-end space-x-[2px]">
      <div className="relative">
        {color === 'main' ? (
          <Image
            src="/icon/star-filled-subcoral.svg"
            width={size}
            height={size}
            alt="star"
          />
        ) : (
          <Image
            src="/icon/star-filled-white.svg"
            width={size}
            height={size}
            alt="star"
          />
        )}
      </div>
      <p
        className={`${styleProps} ${rating ? 'leading-none' : `pl-1 relative top-[${textTop}px]`} `}
      >
        {rating ? rating.toFixed(1) : '  -'}
      </p>
    </div>
  );
};

export default Star;
