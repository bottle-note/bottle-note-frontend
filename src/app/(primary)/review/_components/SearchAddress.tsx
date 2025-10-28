import React from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import PageModal from '@/components/ui/Modal/PageModal';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import KakaoAddressMap from '@/app/(primary)/review/_components/KakaoAddressMap';
import { KakaoPlace } from '@/types/Review';

interface Props {
  handleCloseModal: () => void;
}

export default function SearchAddress({ handleCloseModal }: Props) {
  const { setValue } = useFormContext();

  const saveAddress = (place: KakaoPlace, category?: string | null) => {
    setValue('locationName', place.place_name || null);
    setValue('address', place.road_address_name || place.address_name);
    setValue('category', category);
    setValue('mapUrl', place.place_url || null);
    setValue('longitude', place.x || null);
    setValue('latitude', place.y || null);
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
