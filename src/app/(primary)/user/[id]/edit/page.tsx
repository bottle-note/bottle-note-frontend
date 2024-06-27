'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import ProfileDefaultImg from 'public/profile-default.svg';
import EditForm from './_components/EditForm';

export default function UserEditPage() {
  const router = useRouter();
  const { data: session } = useSession();

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

      <section className="px-5 flex justify-center pt-11 pb-14">
        <div />
        <Image
          src={session?.user.profile ?? ProfileDefaultImg}
          alt="프로필 이미지"
          width={104}
          height={104}
        />
      </section>

      <section className="px-5">
        <EditForm />
      </section>
    </main>
  );
}
