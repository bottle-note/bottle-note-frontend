'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import { ROUTES } from '@/constants/routes';
import BackDrop from '@/components/ui/Modal/BackDrop';

interface Props {
  handleClose: () => void;
  returnTo?: string;
  errorTo?: string;
}

function LoginModal({ handleClose, returnTo, errorTo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLoginClick = () => {
    const queryString = searchParams.toString();
    const currentUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;

    handleClose();
    const params = new URLSearchParams({
      returnTo: returnTo ?? currentUrl,
    });
    if (errorTo) params.set('errorTo', errorTo);
    router.push(`${ROUTES.LOGIN}?${params.toString()}`);
  };

  return (
    <BackDrop isShow>
      <div className="w-full h-full flex flex-col justify-end items-center px-4 gap-3 pb-safe content-container">
        <section className="relative w-full pt-20 bg-bg-layer-floating text-fg-neutral rounded-xl text-center flex flex-col items-center space-y-3 px-4">
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
          <Button btnName="로그인" onClick={handleLoginClick} />
          <button
            className="text-10 text-fg-neutral-muted pb-3"
            onClick={handleClose}
          >
            다음에 할게요
          </button>
        </section>
      </div>
    </BackDrop>
  );
}

export default LoginModal;
