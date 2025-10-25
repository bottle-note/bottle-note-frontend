import React from 'react';
import Image from 'next/image';
import BackDrop from '@/components/ui/Modal/BackDrop';

export default function Loading() {
  return (
    <BackDrop isShow isModal={false}>
      <main className="w-full h-full flex flex-col justify-center items-center backdrop-blur bg-white bg-opacity-50 gap-2">
        <Image
          src="/bottle_note_logo_gray.svg"
          alt="bottle_logo"
          width={48}
          height={103}
          style={{ width: 48, height: 103 }}
        />
        <Image
          src="/bottle_note_logo_text_gray.svg"
          alt="bottle_logo"
          width={48}
          height={30}
          style={{ width: 48, height: 30 }}
        />
      </main>
    </BackDrop>
  );
}
