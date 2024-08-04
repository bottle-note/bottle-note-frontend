'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import type { AlcoholInfo } from '@/types/Review';

interface Props {
  data: AlcoholInfo;
  handleLogin: () => void;
}

function AlcoholInfoDisplay({ data, handleLogin }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isPicked: originalIsPicked } = data;
  const [isPicked, setIsPicked] = useState<boolean>(originalIsPicked);

  return (
    <>
      <section className="relative z-10 flex px-5 pb-6 space-x-5">
        <div className="rounded-lg w-1/3 bg-white p-4">
          <article className="relative h-[120px]">
            {data.imageUrl && (
              <Image
                priority
                src={data.imageUrl}
                alt="img"
                fill
                className="object-contain"
              />
            )}
          </article>
        </div>
        <article className="w-2/3 py-3 text-white space-y-2 overflow-x-hidden">
          <div className="space-y-1">
            <Label
              name={data.korCategory}
              style="border-white px-2 py-[0.15rem] rounded-md text-10"
            />
            <h1 className="text-15 font-semibold whitespace-normal break-words">
              {data.korName && truncStr(data.korName, 27)}
            </h1>
            <p className="text-13 whitespace-normal break-words">
              {data.engName && truncStr(data.engName.toUpperCase(), 45)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="border-[0.5px] border-white" />
            <div className="flex space-x-3">
              <div
                className="text-10 flex"
                onClick={() => {
                  if (!session || !data.alcoholId) {
                    handleLogin();
                    return;
                  }

                  router.push(`/review/register?alcoholId=${data.alcoholId}`);
                }}
              >
                <Image
                  className="mr-1"
                  src="/icon/edit-outlined-white.svg"
                  alt="write"
                  width={16}
                  height={16}
                />
                {/* 추후 user당 하루 리뷰 count 확인하는 API 연동 필요 */}
                <button>리뷰 작성</button>
              </div>
              <div className="border-[0.5px] border-white my-[0.1rem]" />
              <PickBtn
                isPicked={isPicked}
                handleUpdatePicked={() => setIsPicked(!isPicked)}
                handleError={() => setIsPicked(originalIsPicked)}
                handleNotLogin={handleLogin}
                pickBtnName="찜하기"
                alcoholId={data.alcoholId}
              />
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

export default AlcoholInfoDisplay;
