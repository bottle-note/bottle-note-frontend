'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

const TabContent = ({ children, className = '' }: Props) => {
  return <div className={`bg-white ${className}`}>{children}</div>;
};

export default TabContent;
