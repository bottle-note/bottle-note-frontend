'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import { ROUTES } from '@/constants/routes';
import BackDrop from '@/components/ui/Modal/BackDrop';

interface Props {
  handleClose: () => void;
}

function LoginModal({ handleClose }: Props) {
  const router = useRouter();
  return (
    <BackDrop isShow>
      <div className="w-full h-full flex flex-col justify-end items-center px-4 gap-3 pb-7 content-container">
        <section className="relative w-full pt-20 bg-white rounded-xl text-center flex flex-col items-center space-y-3 px-4">
          <article className="absolute top-[-10px]">
            <Image
              src="/icon/logo-subcoral.svg"
              alt="bottle_logo"
              width={50}
              height={60}
              style={{ width: 50, height: 60 }}
              priority
            />
          </article>
          <article>
            <p className="modal-mainText">로그인이 필요한 서비스입니다.</p>
            <p className="modal-subText">로그인 하시겠습니까?</p>
          </article>
          <Button
            btnName="로그인"
            onClick={() => {
              handleClose();
              router.push(ROUTES.LOGIN);
            }}
          />
          <button className="text-10 text-mainGray pb-3" onClick={handleClose}>
            다음에 할게요
          </button>
        </section>
      </div>
    </BackDrop>
  );
}

export default LoginModal;
