'use client';

import React, { useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AlcoholPickButton from '@/components/domain/alcohol/AlcoholPickButton';
import Label from '@/components/ui/Display/Label';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import type { AlcoholInfo as AlcoholType } from '@/types/Review';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { ROUTES } from '@/constants/routes';

interface Props {
  data: AlcoholType;
  handleLogin: () => void;
}

function AlcoholInfo({ data, handleLogin }: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuthSession();
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
      <section className="relative z-10 flex px-20 pt-6 pb-24 space-x-22">
        {data.imageUrl && (
          <AlcoholImage
            imageUrl={data.imageUrl}
            outerWidthClass="w-73"
            outerHeightClass="h-120"
            innerWidthClass="w-53"
            innerHeightClass="h-104"
            enableModal
          />
        )}
        <article className="w-2/3 pt-5 pb-[9.15px] text-white space-y-8 overflow-x-hidden">
          <div className="space-y-6">
            <Label
              name={data.korCategory}
              styleClass="border-white px-8 py-[2.4px] rounded-md text-10"
            />
            <Link
              href={ROUTES.SEARCH.ALL(data.alcoholId)}
              className="block space-y-6"
            >
              <h1 className="text-15 font-semibold whitespace-normal break-words">
                {data?.korName}
              </h1>
              <p className="text-12 whitespace-normal break-words font-normal">
                {data?.engName?.toUpperCase()}
              </p>
            </Link>
          </div>
          <div className="space-y-10 mt-10">
            <div className="border-[0.5px] border-white" />
            <div className="flex space-x-12">
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
                  className="mr-4"
                  src="/icon/edit-outlined-white.svg"
                  alt="write"
                  width={19}
                  height={19}
                />
                <button>리뷰 작성</button>
              </div>
              <div className="border-[0.5px] border-white my-[1.6px]" />
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
