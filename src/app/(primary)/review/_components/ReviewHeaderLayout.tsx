import React from 'react';
import Image from 'next/image';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import SkeletonBase from '@/components/Skeletons/SkeletonBase';
import AlcoholInfo from './AlcoholInfo';

interface ReviewHeaderLayoutProps {
  alcoholData: any;
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
        </SubHeader>
        <AlcoholInfo data={alcoholData} />
      </div>
    </div>
  ) : (
    <SkeletonBase height={330} className="w-full" />
  );
}
