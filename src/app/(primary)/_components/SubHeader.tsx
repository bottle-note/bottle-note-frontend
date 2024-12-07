'use client';

import React, { ReactNode, MouseEvent } from 'react';

interface HeaderLeftProps {
  children: ReactNode;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const HeaderLeft = ({ children, onClick }: HeaderLeftProps) => {
  return (
    <button className="absolute left-3" onClick={onClick}>
      {children}
    </button>
  );
};

interface HeaderCenterProps {
  children: ReactNode;
  textColor: string;
}

const HeaderCenter = ({ children, textColor }: HeaderCenterProps) => {
  return (
    <p
      className={`${textColor} text-[18px] font-semibold absolute left-1/2 transform -translate-x-1/2`}
    >
      {children}
    </p>
  );
};

interface HeaderRightProps {
  children: ReactNode;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const HeaderRight = ({ children, onClick }: HeaderRightProps) => {
  return (
    <button className="absolute right-5" onClick={onClick}>
      {children}
    </button>
  );
};

interface SubHeaderMainProps {
  children?: ReactNode;
  bgColor: string;
}

function SubHeaderMain({ children, bgColor }: SubHeaderMainProps) {
  return (
    <div
      className={`${bgColor} flex justify-between items-center relative pb-8 px-5 pt-20`}
    >
      {children}
    </div>
  );
}

export const SubHeader = Object.assign(SubHeaderMain, {
  Left: HeaderLeft,
  Center: HeaderCenter,
  Right: HeaderRight,
});
