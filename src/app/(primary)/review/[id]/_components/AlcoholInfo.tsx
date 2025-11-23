'use client';

import React, { useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AlcoholPickButton from '@/components/domain/alcohol/AlcoholPickButton';
import Label from '@/components/ui/Display/Label';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import type { AlcoholInfo as AlcoholType } from '@/types/Review';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';

interface Props {
  data: AlcoholType;
  handleLogin: () => void;
}

function AlcoholInfo({ data, handleLogin }: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isPicked: originalIsPicked } = data;
  const [isPicked, setIsPicked] = useState<boolean>(originalIsPicked);

  const handleLoginConfirm = () => {
    if (!isLoggedIn || !data.alcoholId) {
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
            enableModal
          />
        )}
        <article className="w-2/3 pt-[5px] pb-[9.15px] text-white space-y-2 overflow-x-hidden">
          <div className="space-y-[6px]">
            <Label
              name={data.korCategory}
              styleClass="border-white px-2 py-[0.15rem] rounded-md text-10"
            />
            <Link
              href={ROUTES.SEARCH.ALL(data.alcoholId)}
              className="block space-y-[6px]"
            >
              <h1 className="text-15 font-semibold whitespace-normal break-words">
                {data?.korName}
              </h1>
              <p className="text-12 whitespace-normal break-words font-normal">
                {data?.engName?.toUpperCase()}
              </p>
            </Link>
          </div>
          <div className="space-y-[10px] mt-[10px]">
            <div className="border-[0.5px] border-white" />
            <div className="flex space-x-3">
              <div
                className="text-14 font-normal flex"
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
                  width={19}
                  height={19}
                />
                <button>리뷰 작성</button>
              </div>
              <div className="border-[0.5px] border-white my-[0.1rem]" />
              <AlcoholPickButton
                size={19}
                isPicked={isPicked}
                alcoholId={data.alcoholId}
                handleUpdatePicked={() => setIsPicked((prev) => !prev)}
                onApiError={() => setIsPicked(originalIsPicked)}
                handleNotLogin={handleLogin}
                pickBtnName="찜하기"
                fontSize="text-14"
              />
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

export default memo(AlcoholInfo);
