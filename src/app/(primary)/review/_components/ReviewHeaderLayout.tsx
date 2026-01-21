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
  onSelectAlcohol?: () => void;
  isEmptyState?: boolean;
}

export default function ReviewHeaderLayout({
  alcoholData,
  onBack,
  headerTitle,
  headerTextColor = 'text-white',
  onSelectAlcohol,
  isEmptyState = false,
}: ReviewHeaderLayoutProps) {
  const { handleLoginModal } = useModalStore();
  const [isPicked, setIsPicked] = useState<boolean>(false);

  useEffect(() => {
    if (alcoholData?.isPicked !== undefined) {
      setIsPicked(alcoholData.isPicked);
    }
  }, [alcoholData?.isPicked]);

  // 데이터 로딩 중 (빈 상태가 아닌데 데이터가 없는 경우)
  if (!isEmptyState && !alcoholData) {
    return <SkeletonBase height={330} className="w-full" />;
  }

  const showPickButton = alcoholData && !isEmptyState;

  return (
    <div className="relative">
      {/* 배경 이미지 (데이터가 있을 때만) */}
      {alcoholData?.alcoholUrlImg && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${alcoholData.alcoholUrlImg})`,
          }}
        />
      )}
      {/* 오버레이 */}
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
            {showPickButton && (
              <AlcoholPickButton
                size={19}
                isPicked={isPicked}
                alcoholId={alcoholData.alcoholId}
                handleUpdatePicked={() => setIsPicked((prev) => !prev)}
                onApiError={() => setIsPicked(alcoholData.isPicked)}
                handleNotLogin={handleLoginModal}
              />
            )}
          </SubHeader.Right>
        </SubHeader>

        {/* AlcoholInfo: 데이터 유무에 따라 자동으로 빈 상태/정상 상태 렌더링 */}
        <AlcoholInfo data={alcoholData} onSelectAlcohol={onSelectAlcohol} />
      </div>
    </div>
  );
}
