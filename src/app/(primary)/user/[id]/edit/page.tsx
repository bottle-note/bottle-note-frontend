'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import OptionDropdown from '@/components/OptionDropdown';
import { UserApi } from '@/app/api/UserApi';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { AuthService } from '@/lib/AuthService';
import EditForm from './_components/EditForm';
import ProfileDefaultImg from 'public/profile-default.svg';
import ChangeProfile from 'public/change-profile.svg';

export default function UserEditPage() {
  const router = useRouter();
  const { userData } = AuthService;
  const { handleModalState } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);

  const SELECT_OPTIONS = [
    { type: 'camera', name: '카메라' },
    { type: 'album', name: '앨범에서 선택' },
    { type: 'delete', name: '현재 이미지 삭제하기' },
  ];

  const handleOptionSelect = async ({ type }: { type: string }) => {
    if (type === 'camera') return alert(`카메라 접근 기능 준비중입니다.`);
    if (type === 'album') return alert(`앨범 접근 기능 준비중입니다.`);
    if (type === 'delete') {
      try {
        await UserApi.changeProfileImage(null);
        handleModalState({
          isShowModal: true,
          mainText: '저장되었습니다.',
          handleConfirm: () => {
            router.push(`/user/${userData?.userId}`);
          },
        });
      } catch (e) {
        console.error(e);
      }
    }

    setIsOptionShow(false);
  };

  return (
    <main>
      <SubHeader bgColor="bg-bgGray">
        <SubHeader.Left
          onClick={() => {
            router.back();
          }}
        >
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center textColor="text-subCoral">
          마이페이지
        </SubHeader.Center>
      </SubHeader>

      <section className="px-5 flex justify-center h-52 relative">
        <Image
          src={ChangeProfile}
          alt="이미지 수정"
          width={104}
          height={104}
          className="absolute top-[20%] z-20"
          onClick={() => setIsOptionShow(true)}
        />
        <div className="w-[104px] h-[104px] bg-white bg-opacity-60 border-subCoral border-2 rounded-full z-10 absolute top-[20%]" />
        <Image
          src={userData?.profile ?? ProfileDefaultImg}
          alt="프로필 이미지"
          width={104}
          height={104}
          className="absolute top-[20%]"
        />
      </section>

      <section className="px-5">
        <EditForm />
      </section>
      {isOptionShow && (
        <OptionDropdown
          title="프로필 사진 변경"
          options={SELECT_OPTIONS}
          handleOptionSelect={handleOptionSelect}
          handleClose={() => setIsOptionShow(false)}
        />
      )}
      <Modal />
    </main>
  );
}
