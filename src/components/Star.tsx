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
    <div className="flex items-center space-x-1 justify-self-end">
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
      <span className={`${styleProps} w-5 whitespace-pre`}>
        {rating ? rating.toFixed(1) : '  -'}
      </span>
    </div>
  );
};

export default Star;
