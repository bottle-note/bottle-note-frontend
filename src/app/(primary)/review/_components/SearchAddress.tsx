import React from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import PageModal from '@/components/ui/Modal/PageModal';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import KakaoAddressMap from '@/app/(primary)/review/_components/KakaoAddressMap';
import { KakaoPlace } from '@/types/Review';
import { toPlaceLocation } from '@/lib/kakao/kakaoPlaces';

interface Props {
  handleCloseModal: () => void;
}

export default function SearchAddress({ handleCloseModal }: Props) {
  const { setValue } = useFormContext();

  const saveAddress = (place: KakaoPlace) => {
    const location = toPlaceLocation(place);
    setValue('locationName', location.name || null);
    setValue('address', location.address);
    setValue('category', location.category);
    setValue('mapUrl', location.mapUrl);
    setValue('longitude', location.longitude);
    setValue('latitude', location.latitude);
    handleCloseModal();
  };

  return (
    <PageModal>
      <SubHeader>
        <SubHeader.Left
          onClick={() => {
            handleCloseModal();
          }}
        >
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center>장소찾기</SubHeader.Center>
      </SubHeader>
      <KakaoAddressMap handleSaveData={saveAddress} />
    </PageModal>
  );
}
