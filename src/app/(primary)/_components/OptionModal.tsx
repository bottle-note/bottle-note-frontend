'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BackDrop from '@/components/BackDrop';

interface Props {
  options: { name: string; path?: string; action?: () => void }[];
  type?: string;
  handleClose: () => void;
}

function OptionModal({ options, type = '신고하기', handleClose }: Props) {
  const router = useRouter();
  return (
    <BackDrop isShow>
      <div className="w-full h-full flex flex-col justify-end items-center px-4 gap-3 pb-2">
        <section className="w-full bg-white rounded-xl divide-y">
          <article className="py-4 text-center text-mainGray text-sm">
            {type}
          </article>
          {options.map((option) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            <article
              key={option.name}
              className="py-4 text-center text-subCoral"
              onClick={() => {
                if (option.path) {
                  router.push(option.path);
                } else if (option.action) {
                  option.action();
                }
                handleClose();
              }}
            >
              {option.name}
            </article>
          ))}
        </section>
        <button
          className="w-full bg-white rounded-xl py-4"
          onClick={handleClose}
        >
          닫기
        </button>
      </div>
    </BackDrop>
  );
}

export default OptionModal;
