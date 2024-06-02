import Image from 'next/image';

interface Props {
  rating: number;
  size?: number;
  style?: string;
  color?: 'main' | 'white';
}

const Star = ({
  rating,
  size = 18,
  style = 'text-subCoral font-semibold text-base',
  color = 'main',
}: Props) => {
  return (
    <div className="flex items-center space-x-1 justify-self-end">
      {color === 'main' ? (
        <Image
          src="/star-filled-subcoral.svg"
          width={size}
          height={size}
          alt="star"
        />
      ) : (
        <Image
          src="/star-filled-white.svg"
          width={size}
          height={size}
          alt="star"
        />
      )}
      <div className={`${style}`}>{rating.toFixed(1)}</div>
    </div>
  );
};

export default Star;
