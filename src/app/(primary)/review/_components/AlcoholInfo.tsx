import React from 'react';
import { AlcoholInfo as AlcoholType } from '@/types/Alcohol';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Label from '@/components/ui/Display/Label';

interface Props {
  data: AlcoholType;
}

interface DetailItem {
  title: string;
  content: string;
}

function AlcoholInfo({ data }: Props) {
  const { korName, engName, korCategory, alcoholUrlImg, alcoholsTastingTags } =
    data;

  const alcoholDetails: DetailItem[] = [
    { title: '캐스크', content: data.cask },
    { title: '증류소', content: data.engDistillery },
    { title: '국가/지역', content: data.engRegion },
    { title: '도수', content: `${data.abv}%` },
  ];

  return (
    <section className="relative z-10 px-5 pb-[10px] ">
      <div className="flex gap-5">
        <AlcoholImage imageUrl={alcoholUrlImg} />
        <article className="w-full text-white space-y-2 overflow-x-hidden">
          <div className="space-y-[8px]">
            <div className="space-y-[6px]">
              <Label
                name={korCategory}
                styleClass="border-white px-2 py-[0.15rem] rounded-md text-10"
              />
              <h1 className="text-16 font-bold whitespace-normal break-words">
                {korName}
              </h1>
              <p className="text-12 whitespace-normal break-words">
                {engName?.toUpperCase()}
              </p>
            </div>
            <div>
              {alcoholDetails.map((item: DetailItem) => (
                <div
                  key={item.content}
                  className="flex items-start gap-2 text-white"
                >
                  <div className="w-[52px] text-13 font-semibold">
                    {item.title}
                  </div>
                  <div className="flex-1 text-12 font-light">
                    {item.content || '-'}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-[0.5px] border-white" />
          </div>
        </article>
      </div>
      <div className="mt-[10px]">
        {alcoholsTastingTags && alcoholsTastingTags.length > 0 && (
          <div className="flex flex-wrap gap-[6px]">
            {alcoholsTastingTags.map((tag: string) => (
              <Label
                key={tag}
                name={tag}
                styleClass="border-white px-[10px] py-[5px] rounded-md text-12 text-white"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AlcoholInfo;
