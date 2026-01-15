'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import ProfileImage from '@/components/domain/user/ProfileImage';
import OptionDropdown from '@/components/ui/Modal/OptionDropdown';
import { UserApi } from '@/api/user/user.api';
import useModalStore from '@/store/modalStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { uploadImages } from '@/utils/S3Upload';
import { useWebviewCamera } from '@/hooks/useWebviewCamera';
import { useWebViewInit } from '@/hooks/useWebViewInit';
import { ROUTES } from '@/constants/routes';
import { DeviceService } from '@/lib/DeviceService';
import EditForm from './_components/EditForm';
import ChangeProfile from 'public/change-profile.svg';

export default function UserEditPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { user: userData } = useAuth();
  const router = useRouter();
  const { isMobile } = useWebViewInit();
  const { handleModalState, handleCloseModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOptionShow, setIsOptionShow] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const response = await UserApi.getUserInfo({ userId: id });
      setProfileImg(response.data.imageUrl);
    })();
  }, [id]);

  async function handleUploadImg(data: File) {
    const imgData = await uploadImages('userProfile', [data]);
    const { viewUrl } = imgData[0];
    await UserApi.changeProfileImage(viewUrl);
    setProfileImg(viewUrl);
  }

  const { handleOpenAlbum, handleOpenCamera } = useWebviewCamera({
    handleImg: handleUploadImg,
  });

  // Android에서는 카메라 옵션 제외
  const SELECT_OPTIONS =
    DeviceService.platform === 'android'
      ? [
          { type: 'album', name: '앨범에서 선택' },
          { type: 'delete', name: '현재 이미지 삭제하기' },
        ]
      : [
          { type: 'camera', name: '카메라' },
          { type: 'album', name: '앨범에서 선택' },
          { type: 'delete', name: '현재 이미지 삭제하기' },
        ];

  const handleOptionSelect = async ({ type }: { type: string }) => {
    if (type === 'camera') {
      return handleOpenCamera();
    }

    if (type === 'album') {
      if (isMobile) return handleOpenAlbum();
      return fileInputRef.current?.click();
    }

    if (type === 'delete') {
      try {
        await UserApi.changeProfileImage(null);

        handleModalState({
          isShowModal: true,
          mainText: '삭제되었습니다.',
          handleConfirm: () => {
            handleCloseModal();
            router.push(ROUTES.USER.BASE(userData?.userId!));
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
      <SubHeader>
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
        <SubHeader.Center>마이페이지</SubHeader.Center>
      </SubHeader>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const fileInput = event.target;
          const file = fileInput.files?.[0];

          if (file) {
            handleUploadImg(file);
            fileInput.value = '';
          }
        }}
      />

      <section className="px-5 flex justify-center h-52 relative">
        <Image
          src={ChangeProfile}
          alt="이미지 수정"
          width={104}
          height={104}
          className="absolute top-[20%] z-20"
          onClick={() => setIsOptionShow(true)}
        />
        <div className="bg-white bg-opacity-60 rounded-full z-10 absolute top-[20%]">
          <ProfileImage
            profileImgSrc={profileImg}
            size={104}
            borderWidth="bold"
            opacity={0.5}
          />
        </div>
      </section>

      <section className="px-5">
        <EditForm userId={id} />
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
