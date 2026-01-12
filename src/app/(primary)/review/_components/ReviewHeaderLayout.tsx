import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import AlcoholPickButton from '@/components/domain/alcohol/AlcoholPickButton';
import { AlcoholInfo as AlcoholDetails } from '@/types/Alcohol';
import useModalStore from '@/store/modalStore';
import AlcoholInfo from './AlcoholInfo';

interface ReviewHeaderLayoutProps {
  alcoholData: AlcoholDetails | undefined;
  onBack: () => void;
  headerTitle: string;
  headerTextColor?: string;
}

export default function ReviewHeaderLayout({
  alcoholData,
  onBack,
  headerTitle,
  headerTextColor = 'text-white',
}: ReviewHeaderLayoutProps) {
  const { handleLoginModal } = useModalStore();
  const [isPicked, setIsPicked] = useState<boolean>(false);

  useEffect(() => {
    if (alcoholData?.isPicked !== undefined) {
      setIsPicked(alcoholData.isPicked);
    }
  }, [alcoholData?.isPicked]);

  return alcoholData ? (
    <div className="relative">
      {alcoholData?.alcoholUrlImg && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${alcoholData.alcoholUrlImg})`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-mainCoral bg-opacity-90 z-10" />
      <div className="relative z-20">
        <SubHeader bgColor="bg-transparent">
          <SubHeader.Left onClick={onBack}>
            <Image
              src="/icon/arrow-left-white.svg"
              alt="arrowIcon"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center textColor={headerTextColor}>
            {headerTitle}
          </SubHeader.Center>
          <SubHeader.Right>
            <AlcoholPickButton
              size={19}
              isPicked={isPicked}
              alcoholId={alcoholData.alcoholId}
              handleUpdatePicked={() => setIsPicked((prev) => !prev)}
              onApiError={() => setIsPicked(alcoholData.isPicked)}
              handleNotLogin={handleLoginModal}
            />
          </SubHeader.Right>
        </SubHeader>
        <AlcoholInfo data={alcoholData} />
      </div>
    </div>
  ) : (
    <SkeletonBase height={330} className="w-full" />
  );
}
