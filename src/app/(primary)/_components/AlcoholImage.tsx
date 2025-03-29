import Image from 'next/image';

interface Props {
  imageUrl: string;
  outerHeightClass?: string;
  outerWidthClass?: string;
  innerHeightClass?: string;
  innerWidthClass?: string;
}

const AlcoholImage = ({
  imageUrl,
  outerHeightClass = 'h-[162px]',
  outerWidthClass = 'w-[100px]',
  innerHeightClass = 'w-[80px] ',
  innerWidthClass = 'h-[140px]',
}: Props) => (
  <div className="rounded-lg bg-white flex items-center justify-center">
    <article
      className={`${outerHeightClass} ${outerWidthClass} shrink-0 relative flex items-center justify-center`}
    >
      <div className={`${innerHeightClass} ${innerWidthClass} relative`}>
        <Image
          priority
          src={imageUrl}
          alt="alcohol image"
          fill
          className="object-contain"
          sizes="100px"
        />
      </div>
    </article>
  </div>
);

export default AlcoholImage;
