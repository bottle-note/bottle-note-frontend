import React from 'react';
import Image from 'next/image';

interface Props {
  text?: string;
}

function EmptyView({ text = '검색 결과가 없어요!' }: Props) {
  return (
    <div className="h-72 flex flex-col justify-center items-center gap-5">
      <Image
        src="/icon/logo-subcoral.svg"
        alt="bottle_logo"
        width={50}
        height={60}
        style={{ width: 50, height: 60 }}
        priority
      />
      <p className="text-mainGray whitespace-pre text-center">{text}</p>
    </div>
  );
}

export default EmptyView;
