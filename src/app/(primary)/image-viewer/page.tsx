'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';

export default function ImageViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const src = searchParams.get('src');
  const title = searchParams.get('title') || '이미지';

  if (!src) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>이미지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <SubHeader>
        <SubHeader.Left onClick={() => router.back()}>
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center>{title}</SubHeader.Center>
      </SubHeader>
      <div>
        <Image
          src={src}
          alt={title}
          width={800}
          height={600}
          className="w-auto h-auto"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </>
  );
}
