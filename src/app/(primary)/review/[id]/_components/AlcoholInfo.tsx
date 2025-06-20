'use client';

import React, { useState, memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import Label from '@/app/(primary)/_components/Label';
import AlcoholImage from '@/app/(primary)/_components/AlcoholImage';
import { truncStr } from '@/utils/truncStr';
import type { AlcoholInfo as AlcoholType } from '@/types/Review';
import { AuthService } from '@/lib/AuthService';
import { ROUTES } from '@/constants/routes';

interface Props {
  data: AlcoholType;
  handleLogin: () => void;
}

function AlcoholInfo({ data, handleLogin }: Props) {
  const router = useRouter();
  const { isLogin } = AuthService;
  const { isPicked: originalIsPicked } = data;
  const [isPicked, setIsPicked] = useState<boolean>(originalIsPicked);

  const handleLoginConfirm = () => {
    if (!isLogin || !data.alcoholId) {
      handleLogin();
      return;
    }
    router.push(ROUTES.REVIEW.REGISTER(data.alcoholId));
  };

  return (
    <>
      <section className="relative z-10 flex px-5 pt-[6px] pb-6 space-x-[22px]">
        {data.imageUrl && (
          <AlcoholImage
            imageUrl={data.imageUrl}
            outerWidthClass="w-[73px]"
            outerHeightClass="h-[120px]"
            innerWidthClass="w-[53px]"
            innerHeightClass="h-[104px]"
          />
        )}
        <article className="w-2/3 pt-[5px] pb-[9.15px] text-white space-y-2 overflow-x-hidden">
          <div className="space-y-[6px]">
            <Label
              name={data.korCategory}
              styleClass="border-white px-2 py-[0.15rem] rounded-md text-10"
            />
            <h1 className="text-15 font-semibold whitespace-normal break-words">
              {data.korName && truncStr(data.korName, 27)}
            </h1>
            <p className="text-12 whitespace-normal break-words font-normal">
              {data.engName && truncStr(data.engName.toUpperCase(), 45)}
            </p>
          </div>
          <div className="space-y-[10px] mt-[10px]">
            <div className="border-[0.5px] border-white" />
            <div className="flex space-x-3">
              <div
                className="text-12 font-normal flex"
                onClick={handleLoginConfirm}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLoginConfirm();
                  }
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
                size={16}
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

export default memo(AlcoholInfo);
