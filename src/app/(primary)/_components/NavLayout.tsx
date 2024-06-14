import React from 'react';
import Navbar from '@/components/Navbar';

interface Props {
  showNavbar?: boolean;
  children: React.ReactNode;
}

export default function NavLayout({ showNavbar = true, children }: Props) {
  return (
    <>
      {children}
      {showNavbar && <Navbar maxWidth="430px" />}
    </>
  );
}
