import SemanticIcon from '@/components/ui/Display/SemanticIcon';

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
  mainTextClass = 'text-fg-neutral-muted',
  subTextClass,
}: Props) => {
  return (
    <div
      className={`flex justify-end text-12 font-semibold gap-[1px] ${mainTextClass}`}
    >
      {iconSrc && (
        <SemanticIcon
          src={iconSrc}
          width={iconWidth}
          height={iconHeight}
          className="pb-[2px]"
        />
      )}
      <span>{pointContent === '0.0' ? '-' : pointContent}</span>
      <p className={`flex ${subTextClass} items-center`}>
        (
        <>
          <SemanticIcon
            src="/icon/rating-count-gray.svg"
            width={12}
            height={12}
          />
          <span>{countContent}</span>
        </>
        )
      </p>
    </div>
  );
};
