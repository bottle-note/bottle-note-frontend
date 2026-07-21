'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import Navbar from '@/components/ui/Navigation/Navbar';
import { useScrollState } from '@/hooks/useScrollState';

interface NavLayoutContextValue {
  isNavbarSuppressed: boolean;
  isScrollVisible: boolean;
  setNavbarSuppressed: (suppressed: boolean) => void;
}

const NavLayoutContext = createContext<NavLayoutContextValue | null>(null);

export function useNavLayout() {
  const context = useContext(NavLayoutContext);

  if (!context) {
    throw new Error('useNavLayout must be used within NavLayout');
  }

  return context;
}

interface Props {
  showNavbar?: boolean;
  children: React.ReactNode;
}

export default function NavLayout({ showNavbar = true, children }: Props) {
  const [isNavbarSuppressed, setNavbarSuppressed] = useState(false);
  const { isVisible: isScrollVisible } = useScrollState(100);
  const contextValue = useMemo(
    () => ({ isNavbarSuppressed, isScrollVisible, setNavbarSuppressed }),
    [isNavbarSuppressed, isScrollVisible],
  );

  return (
    <NavLayoutContext.Provider value={contextValue}>
      <main>{children}</main>
      {showNavbar && (
        <Navbar
          isSuppressed={isNavbarSuppressed}
          isScrollVisible={isScrollVisible}
        />
      )}
    </NavLayoutContext.Provider>
  );
}
