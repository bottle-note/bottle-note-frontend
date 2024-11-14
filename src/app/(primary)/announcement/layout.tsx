'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '../_components/SubHeader';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <main className="bg-white flex flex-col w-full mx-auto max-w-[430px] min-h-screen">
      <SubHeader bgColor="bg-bgGray">
        <SubHeader.Left onClick={() => router.back()}>
          <Image
            src="/icon/arrow-left-subCoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center textColor="text-subCoral">공지사항</SubHeader.Center>
      </SubHeader>
      <section className="py-8 px-5">{children}</section>
    </main>
  );
}
