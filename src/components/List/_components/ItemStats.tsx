import Image from 'next/image';
import RatingCountIcon from 'public/icon/rating-count-black.svg';

interface Props {
  iconSrc?: string;
  iconWidth?: number;
  iconHeight?: number;
  pointContent: string;
  countContent: string;
}

export const ItemStats = ({
  iconSrc,
  iconWidth = 12,
  iconHeight = 12,
  pointContent,
  countContent,
}: Props) => {
  return (
    <div className="flex justify-end text-12 font-semibold gap-[1px]">
      {iconSrc && (
        <Image
          src={iconSrc}
          alt="평가"
          className="pb-[2px]"
          width={iconWidth}
          height={iconHeight}
        />
      )}
      <span>{pointContent}</span>
      <p className="flex">
        (
        <>
          <Image
            src={RatingCountIcon}
            alt="평가 참여자 수"
            className="pb-[2px]"
          />
          <span>{countContent}</span>
        </>
        )
      </p>
    </div>
  );
};
