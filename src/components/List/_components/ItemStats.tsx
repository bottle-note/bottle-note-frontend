import Image from 'next/image';
import RatingCountIcon from 'public/icon/rating-count-gray.svg';

interface Props {
  iconSrc?: string;
  iconWidth?: number;
  iconHeight?: number;
  pointContent: string;
  countContent: string;
  mainTextClass?: string;
  subTextClass?: string;
}

export const ItemStats = ({
  iconSrc,
  iconWidth = 12,
  iconHeight = 12,
  pointContent,
  countContent,
  mainTextClass,
  subTextClass,
}: Props) => {
  return (
    <div
      className={`flex justify-end text-12 font-semibold gap-[1px] ${mainTextClass}`}
    >
      {iconSrc && (
        <Image
          src={iconSrc}
          alt="평가"
          className="pb-[2px]"
          width={iconWidth}
          height={iconHeight}
        />
      )}
      <span>{pointContent === '0.0' ? '-' : pointContent}</span>
      <p className={`flex ${subTextClass} items-center`}>
        (
        <>
          <Image
            src={RatingCountIcon}
            alt="평가 참여자 수"
            className="w-[12px] h-[12px] "
          />
          <span>{countContent}</span>
        </>
        )
      </p>
    </div>
  );
};
