import React, { useState, useEffect } from 'react';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import { AlcoholInfo as AlcoholDetails } from '@/types/Alcohol';
import PickBtn from '../../_components/PickBtn';
import AlcoholImage from '@/app/(primary)/_components/AlcoholImage';
import useModalStore from '@/store/modalStore';

interface Props {
  data: AlcoholDetails;
}

interface DetailItem {
  title: string;
  content: string;
}

function AlcoholInfo({ data }: Props) {
  const {
    korName,
    engName,
    korCategory,
    isPicked: originalIsPicked,
    alcoholUrlImg,
    alcoholId,
  } = data;
  const { handleLoginModal } = useModalStore();
  const [isPicked, setIsPicked] = useState<boolean>(originalIsPicked ?? false);

  const alcoholDetails: DetailItem[] = [
    { title: '캐스크', content: data.cask },
    { title: '증류소', content: data.engDistillery },
    { title: '국가/지역', content: data.engRegion },
    { title: '도수', content: `${data.avg}%` },
  ];

  return (
    <section className="relative z-10 flex px-5 pb-6 space-x-5">
      <AlcoholImage imageUrl={alcoholUrlImg} />
      <article className="w-full py-3 text-white space-y-2 overflow-x-hidden">
        <div className="space-y-2">
          <div className="space-y-1">
            <Label
              name={korCategory}
              styleClass="border-white px-2 py-[0.15rem] rounded-md text-10"
            />
            <h1 className="text-15 font-semibold whitespace-normal break-words">
              {truncStr(korName, 27)}
            </h1>
            <p className="text-13 whitespace-normal break-words">
              {truncStr(engName.toUpperCase(), 45)}
            </p>
          </div>
          <div>
            {alcoholDetails.map((item: DetailItem) => (
              <div
                key={item.content}
                className="flex items-start text-11 gap-2 text-white"
              >
                <div className="w-12 font-semibold">{item.title}</div>
                <div className="flex-1 font-light">{item.content || '-'}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="border-[0.5px] border-white" />
            <PickBtn
              isPicked={isPicked}
              handleUpdatePicked={() => setIsPicked(!isPicked)}
              handleError={() => setIsPicked(originalIsPicked)}
              pickBtnName="찜하기"
              alcoholId={alcoholId}
              handleNotLogin={handleLoginModal}
            />
          </div>
        </div>
      </article>
    </section>
  );
}

export default AlcoholInfo;
