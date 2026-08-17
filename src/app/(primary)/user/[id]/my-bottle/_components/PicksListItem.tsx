import { useState } from 'react';
import Link from 'next/link';
import Label from '@/components/ui/Display/Label';
import AlcoholPickButton from '@/components/domain/alcohol/AlcoholPickButton';
import ItemImage from '@/components/feature/List/_components/ItemImage';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import { ItemStats } from '@/components/feature/List/_components/ItemStats';
import useModalStore from '@/store/modalStore';
import { PickMyBottleListResponse } from '@/types/MyBottle';
import { addNewLine } from '@/utils/addNewLine';
import { ROUTES } from '@/constants/routes';
import { LABEL_NAMES } from '@/constants/common';

interface Props {
  data: PickMyBottleListResponse['myBottleList'][number];
  isMyPage?: boolean;
}

export const PicksListItem = ({ data, isMyPage }: Props) => {
  const {
    baseMyBottleInfo: {
      alcoholId,
      imageUrl,
      alcoholKorName,
      alcoholEngName,
      korCategoryName,
      isHot,
    },
    isPicked: initialIsPicked,
    totalPicksCount,
  } = data;

  const [isPicked, setIsPicked] = useState(initialIsPicked);
  const { handleLoginModal } = useModalStore();

  return (
    <section className="flex items-center border-b border-stroke-neutral-subtle py-2 text-fg-neutral">
      {/* image */}
      <Link href={ROUTES.SEARCH.ALL(alcoholId)} className="mr-3 shrink-0">
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(alcoholId)}
        className="flex flex-col items-start justify-center space-y-1.5"
      >
        {isHot && (
          <Label
            name={LABEL_NAMES.HOT_5}
            styleClass="mb-1 rounded border-stroke-brand-solid bg-bg-brand-solid px-2 py-[0.1rem] text-[8px] text-fg-brand-contrast"
          />
        )}
        <ItemInfo
          korName={addNewLine(alcoholKorName)}
          engName={alcoholEngName}
          korCategory={korCategoryName}
        />

        <ItemStats
          iconSrc="/icon/pick-filled-black.svg"
          pointContent="찜"
          countContent={totalPicksCount.toString()}
        />
      </Link>

      {/* my rating point */}
      <div className="ml-auto pr-1 flex flex-col items-end">
        {!isMyPage && initialIsPicked && (
          <p className="text-10 font-bold text-fg-neutral-muted">통했찜</p>
        )}
        <AlcoholPickButton
          isPicked={isPicked}
          alcoholId={alcoholId}
          handleUpdatePicked={
            isMyPage ? () => setIsPicked((prev) => !prev) : undefined
          }
          onApiError={() => setIsPicked(initialIsPicked)}
          size={25}
          tone="brand"
          handleNotLogin={handleLoginModal}
        />
      </div>
    </section>
  );
};
