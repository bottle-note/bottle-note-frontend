import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import { AlcoholInfo as AlcoholDetails } from '@/types/Alcohol';
import { AlcoholsApi } from '@/app/api/AlcholsApi';

interface Props {
  data: AlcoholDetails;
}

function AlcoholInfo({ data }: Props) {
  const { data: session } = useSession();
  const { korName, engName, korCategory, isPicked } = data;
  const [details, setDetails] = useState<any>([]);
  const [isLiked, setIsLiked] = useState<boolean>(isPicked);

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
          content: data.avg + '%',
        },
      ]);
    }
  }, [data]);

  return (
    <section className="relative z-10 flex px-5 pb-6 space-x-5">
      <div className="rounded-lg flex-1 bg-white p-2">
        <article className="relative h-[180px] w-[135px] flex shrink-0">
          {data?.alcoholUrlImg && (
            <Image
              priority
              src={data.alcoholUrlImg}
              alt="img"
              fill
              className="object-contain"
            />
          )}
        </article>
      </div>
      <article className="flex-2 py-3 text-white space-y-2 overflow-x-hidden">
        {data && (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label
                name={korCategory}
                style={'border-white px-2 py-[0.15rem] rounded-md text-10'}
              />
              <h1 className="text-15 font-semibold whitespace-normal break-words">
                {truncStr(korName, 27)}
              </h1>
              <p className="text-13 whitespace-normal break-words">
                {truncStr(engName.toUpperCase(), 45)}
              </p>
            </div>
            <div>
              {details.map((data: any) => (
                <div
                  key={data.content}
                  className="flex text-9 text-white items-start"
                >
                  <div className="min-w-14 font-semibold">{data.title}</div>
                  <div className="flex-1 font-light">{data.content}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="border-[0.5px] border-white" />
              <div className="flex space-x-3">
                <div
                  className="text-10 flex"
                  onClick={async () => {
                    if (session) {
                      // API 에러에 대한 대응 추가 필요
                      await AlcoholsApi.putLike(data.alcoholId, !isLiked);
                      setIsLiked(!isLiked);
                    } else {
                      // login 필요
                    }
                  }}
                >
                  <Image
                    className="mr-1"
                    src={
                      isLiked
                        ? '/icon/like-filled-white.svg'
                        : '/icon/Like-outlined-white.svg'
                    }
                    alt="like"
                    width={16}
                    height={16}
                  />
                  <button>찜하기</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}

export default AlcoholInfo;
