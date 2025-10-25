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

interface Props {
  data: PickMyBottleListResponse['myBottleList'][number];
}

export const PicksListItem = ({ data }: Props) => {
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
    <section className="text-mainBlack border-brightGray border-b py-2 flex items-center">
      {/* image */}
      <Link href={ROUTES.SEARCH.ALL(alcoholId)}>
        <ItemImage src={imageUrl} alt="image" />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(alcoholId)}
        className="flex flex-col items-start justify-center space-y-1.5"
      >
        {isHot && (
          <Label
            name="HOT 5"
            styleClass="bg-subCoral text-white px-2 py-[0.1rem] border-subCoral text-[8px] rounded mb-1"
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
        {/* FIXME: api 에서 정보를 주면 노출 조건 변경 */}
        <p className="text-10 text-mainGray font-bold">통했찜</p>
        <AlcoholPickButton
          isPicked={isPicked}
          alcoholId={alcoholId}
          handleUpdatePicked={() => setIsPicked((prev) => !prev)}
          onApiError={() => setIsPicked(initialIsPicked)}
          size={25}
          iconColor="subcoral"
          handleNotLogin={handleLoginModal}
        />
      </div>
    </section>
  );
};
