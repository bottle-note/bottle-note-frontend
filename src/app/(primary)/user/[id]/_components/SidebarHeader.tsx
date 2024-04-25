'use client';

import { useState } from 'react';
import Image from 'next/image';
import Logo from 'public/Logo_2.svg';
import Menu from 'public/Menu_Sub_Coral.svg';

const SidebarHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <article className="flex justify-between pb-6">
        <button>
          <Image src={Logo} alt="보틀노트" />
        </button>

        <button onClick={() => setIsOpen(true)}>
          <Image src={Menu} alt="메뉴 열기" />
        </button>
      </article>

      {isOpen && (
        <div>
          <button onClick={() => setIsOpen(false)}>닫아라옹 X</button>
        </div>
      )}
    </>
  );
};

export default SidebarHeader;
