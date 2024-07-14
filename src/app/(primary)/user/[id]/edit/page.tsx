'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import ProfileDefaultImg from 'public/profile-default.svg';
import ChangeProfile from 'public/change-profile.svg';
import EditForm from './_components/EditForm';
import OptionDropdown from '@/components/OptionDropdown';

export default function UserEditPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOptionShow, setIsOptionShow] = useState(false);

  const SELECT_OPTIONS = [
    { type: 'camera', name: '카메라' },
    { type: 'album', name: '앨범에서 선택' },
    { type: 'delete', name: '현재 이미지 삭제하기' },
  ];

  // TODO: 타입 가드 추가
  const handleOptionSelect = ({
    type,
    name,
  }: {
    type: string;
    name: string;
  }) => {
    setIsOptionShow(false);
    console.log(type, name);
    // TODO: type 에 따른 로직 추가
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
          src={session?.user.profile ?? ProfileDefaultImg}
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
    </main>
  );
}
