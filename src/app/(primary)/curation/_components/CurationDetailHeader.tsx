import Image from 'next/image';
import AutoMarqueeText from '@/components/ui/Display/AutoMarqueeText';

const DETAIL_HEADER_HEIGHT = 'calc(var(--header-height-with-safe) + 38px)';

interface CurationDetailHeaderProps {
  title: string;
  onBack?: () => void;
}

export function CurationDetailHeader({
  title,
  onBack,
}: CurationDetailHeaderProps) {
  return (
    <>
      <div className="fixed-content top-0 z-30 bg-white">
        <div className="flex w-full items-center px-[17px] pb-[15px] pt-safe-header">
          {onBack ? (
            <button
              type="button"
              className="flex w-11 shrink-0 items-center"
              onClick={onBack}
            >
              <Image
                src="/icon/arrow-left-subcoral.svg"
                alt="뒤로가기"
                width={23}
                height={23}
              />
            </button>
          ) : (
            <div className="w-11 shrink-0" />
          )}

          <div className="min-w-0 flex-1 px-2">
            <AutoMarqueeText
              text={title}
              className="text-center text-16 font-bold text-subCoral"
            />
          </div>

          <div className="w-11 shrink-0" />
        </div>
      </div>
      <div aria-hidden style={{ height: DETAIL_HEADER_HEIGHT }} />
    </>
  );
}
