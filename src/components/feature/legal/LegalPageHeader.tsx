'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';

interface LegalPageHeaderProps {
  title: string;
}

export function LegalPageHeader({ title }: LegalPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 border-b border-stroke-neutral-subtle bg-bg-layer-default">
      <SubHeader>
        <SubHeader.Left onClick={() => router.back()}>
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="뒤로 가기"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center>{title}</SubHeader.Center>
      </SubHeader>
    </header>
  );
}
