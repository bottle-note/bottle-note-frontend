import Image from 'next/image';

interface Props {
  rating: number;
  size?: number;
  styleProps?: string;
  color?: 'main' | 'white';
}

const Star = ({
  rating,
  size = 18,
  styleProps = 'text-subCoral font-semibold text-15',
  color = 'main',
}: Props) => {
  return (
    <div className="inline-flex items-baseline space-x-[2px]">
      <div className="relative top-[1px]">
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
      <p className={`${styleProps} w-5`}>
        {rating ? rating.toFixed(1) : '  -'}
      </p>
    </div>
  );
};

export default Star;
