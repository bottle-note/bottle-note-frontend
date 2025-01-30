'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import OptionDropdown from '@/components/OptionDropdown';
import { UserApi } from '@/app/api/UserApi';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { AuthService } from '@/lib/AuthService';
import { handleWebViewMessage, sendLogToFlutter } from '@/utils/flutterUtil';
import { base64ToFile } from '@/utils/base64ToFile';
import { uploadImages } from '@/utils/S3Upload';
import EditForm from './_components/EditForm';
import ProfileDefaultImg from 'public/profile-default.svg';
import ChangeProfile from 'public/change-profile.svg';

export default function UserEditPage() {
  const router = useRouter();
  const { userData } = AuthService;
  const { handleModalState, handleCloseModal } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SELECT_OPTIONS = [
    { type: 'camera', name: '카메라' },
    { type: 'album', name: '앨범에서 선택' },
    { type: 'delete', name: '현재 이미지 삭제하기' },
  ];

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleOptionSelect = async ({ type }: { type: string }) => {
    if (type === 'camera') return alert(`카메라 접근 기능 준비중입니다.`);
    if (type === 'album') {
      if (isMobile) {
        return handleWebViewMessage('openAlbum');
      }

      fileInputRef.current?.click();
    }
    if (type === 'delete') {
      try {
        await UserApi.changeProfileImage(null);
        handleModalState({
          isShowModal: true,
          mainText: '저장되었습니다.',
          handleConfirm: () => {
            handleCloseModal();
            router.push(`/user/${userData?.userId}`);
          },
        });
      } catch (e) {
        console.error(e);
      }
    }

    setIsOptionShow(false);
  };

  const handleUploadImg = async (data: string | File) => {};

  useEffect(() => {
    console.log('image data changed');

    const getImgUrl = async () => {
      try {
        console.log('getImgUrl called');

        if (imageData?.length) {
          const imgFile = base64ToFile(imageData);
          console.log(imgFile);

          const imgData = await uploadImages('userProfile', [imgFile]);
          console.log(imgData);

          // viewURL을 가져와 프로필 이미지로 지정
          window.sendLogToFlutter(
            `이미지 데이터 수신 성공 ${JSON.stringify(imgData)}`,
          );
        }
      } catch (error) {
        console.error('Error in getImgUrl:', error);
        window.sendLogToFlutter(
          `이미지 업로드 실패: ${(error as Error).message}`,
        );
      }
    };

    getImgUrl();
  }, [imageData]);

  // NOTE: 웹뷰 핸들러 함수 window 전역객체 등록
  useLayoutEffect(() => {
    if (isMobile) {
      handleWebViewMessage('checkIsInApp');
    }

    window.openAlbum = (imgDataBase64) => {
      setImageData(imgDataBase64);
    };

    window.sendLogToFlutter = sendLogToFlutter;
  }, []);

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

      <input
        ref={fileInputRef} // ref 사용
        type="file"
        accept="image/*" // 이미지 파일만 선택 가능
        style={{ display: 'none' }} // 파일 입력 필드를 숨김
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleUploadImg(file);
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
