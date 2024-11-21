import React from 'react';
import Image from 'next/image';
import BackDrop from './BackDrop';

export default function Loading() {
  return (
    <BackDrop isShow>
      <main className="w-full h-full flex flex-col justify-center items-center backdrop-blur bg-black bg-opacity-50 gap-2">
        <Image
          src="/icon/logo-white.svg"
          alt="bottle_logo"
          width={60}
          height={102}
        />
        <Image
          src="/icon/logo-text-white.svg"
          alt="bottle_logo"
          width={60}
          height={102}
        />
      </main>
    </BackDrop>
  );
}
