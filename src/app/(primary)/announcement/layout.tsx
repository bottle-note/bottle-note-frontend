'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <main className="bg-white flex flex-col content-container min-h-screen">
      <SubHeader>
        <SubHeader.Left onClick={() => router.back()}>
          <Image
            src="/icon/arrow-left-subCoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center>공지사항</SubHeader.Center>
      </SubHeader>
      <section className="py-8 px-5">{children}</section>
    </main>
  );
}
