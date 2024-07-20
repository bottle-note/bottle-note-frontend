'use client';

import Image from 'next/image';
import { SubHeader } from '../_components/SubHeader';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-white flex flex-col w-full mx-auto max-w-[430px] min-h-screen">
      <SubHeader bgColor="bg-bgGray">
        <SubHeader.Left onClick={() => {}}>
          <Image
            src="/icon/arrow-left-subCoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center textColor="text-subCoral">공지사항</SubHeader.Center>
      </SubHeader>
      {children}
    </main>
  );
}
