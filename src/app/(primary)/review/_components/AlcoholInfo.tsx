import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import { AlcoholInfo as AlcoholDetails } from '@/types/Alcohol';
import PickBtn from '../../_components/PickBtn';

interface Props {
  data: AlcoholDetails;
}

function AlcoholInfo({ data }: Props) {
  const { korName, engName, korCategory, isPicked: originalIsPicked } = data;
  const [details, setDetails] = useState<any>([]);
  const [isPicked, setIsPicked] = useState<boolean>(originalIsPicked ?? false);

  useEffect(() => {
    if (data) {
      setDetails([
        {
          title: '캐스크',
          content: data.cask,
        },
        {
          title: '증류소',
          content: data.engDistillery,
        },
        {
          title: '국가/지역',
          content: data.engRegion,
        },
        {
          title: '도수',
          content: `${data.avg}%`,
        },
      ]);
    }
  }, [data]);

  return (
    <section className="relative z-10 flex px-5 pb-6 space-x-5">
      <div className="rounded-lg bg-white p-2 flex items-center justify-center">
        <article className="h-[162px] w-[100px] shrink-0 relative flex items-center justify-center">
          <div className="relative w-[80px] h-[140px]">
            {data?.alcoholUrlImg && (
              <Image
                priority
                src={data.alcoholUrlImg}
                alt="img"
                fill
                className="object-contain"
                sizes="100px"
              />
            )}
          </div>
        </article>
      </div>
      <article className="flex-2 py-3 text-white space-y-2 overflow-x-hidden">
        {data && (
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
              {details.map((item: any) => (
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
                alcoholId={data.alcoholId}
                handleNotLogin={() => {}}
              />
            </div>
          </div>
        )}
      </article>
    </section>
  );
}

export default AlcoholInfo;
