import Image from 'next/image';

const AlcoholImage = ({ imageUrl }: { imageUrl: string }) => (
  <div className="rounded-lg bg-white p-2 flex items-center justify-center">
    <article className="h-[162px] w-[100px] shrink-0 relative flex items-center justify-center">
      <div className="relative w-[80px] h-[140px]">
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
