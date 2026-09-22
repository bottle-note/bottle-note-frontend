'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import NavLayout, { useNavLayout } from '@/components/ui/Layout/NavLayout';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';
import { ROUTES } from '@/constants/routes';
import { clearSearchParams } from '@/utils/clearSearchParams';

const tabList = [
  { id: 'clearance', name: '수입통관' },
  { id: 'importer', name: '수입사' },
];

const TAB_SCOPED_SEARCH_PARAMS = [
  'keyword',
  'startDate',
  'endDate',
  'country',
  'alcoholType',
] as const;

interface ImportClearanceSearchContextValue {
  setIsSearchActive: (active: boolean) => void;
}

const ImportClearanceSearchContext =
  createContext<ImportClearanceSearchContextValue | null>(null);

function ImportClearanceNavigationContent({
  isSearchActive,
  renderHeader,
  children,
}: Readonly<{
  isSearchActive: boolean;
  renderHeader: (isHeaderCollapsed: boolean) => React.ReactNode;
  children: React.ReactNode;
}>) {
  const { isNavigationVisible } = useNavLayout();

  return (
    <>
      {renderHeader(isSearchActive || !isNavigationVisible)}
      {children}
    </>
  );
}

export function useImportClearanceSearchNavigation() {
  const context = useContext(ImportClearanceSearchContext);

  if (!context) {
    throw new Error(
      'useImportClearanceSearchNavigation must be used within ImportClearanceNavLayout.',
    );
  }

  return context;
}

export function ImportClearanceNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const tab = searchParams.get('tab');
  const currentTabId = tab === 'importer' ? 'importer' : 'clearance';
  const currentTabObj =
    tabList.find((t) => t.id === currentTabId) || tabList[0];
  const { refs, registerTab } = useTab({ tabList });

  const handleTab = (tabId: string) => {
    if (tabId === currentTabId) return;

    const params = new URLSearchParams(searchParams.toString());
    clearSearchParams(params, TAB_SCOPED_SEARCH_PARAMS);

    if (tabId === 'importer') {
      params.set('tab', 'importer');
    } else {
      params.delete('tab');
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const isListPage = pathname === ROUTES.IMPORT_CLEARANCE.BASE;

  const searchContextValue = useMemo(
    () => ({ setIsSearchActive }),
    [setIsSearchActive],
  );

  return (
    <ImportClearanceSearchContext.Provider value={searchContextValue}>
      <NavLayout showNavbar={isListPage}>
        <ImportClearanceNavigationContent
          isSearchActive={isSearchActive}
          renderHeader={(isHeaderCollapsed) =>
            isListPage && (
              <div className="fixed-content top-0 z-10 bg-bg-layer-default">
                <AutoHideLogoHeader
                  isVisible={!isHeaderCollapsed}
                  sticky={false}
                />
                <div
                  className="scroll-navigation-motion absolute inset-x-0 top-[var(--header-height-with-safe)] transition-transform"
                  style={{
                    transform: isHeaderCollapsed
                      ? 'translateY(0)'
                      : 'translateY(var(--logo-header-slide-distance))',
                  }}
                >
                  <Tab
                    variant="bookmark"
                    tabList={tabList}
                    currentTab={currentTabObj}
                    handleTab={handleTab}
                    scrollContainerRef={refs.scrollContainerRef}
                    registerTab={registerTab}
                  />
                </div>
              </div>
            )
          }
        >
          {children}
        </ImportClearanceNavigationContent>
      </NavLayout>
    </ImportClearanceSearchContext.Provider>
  );
}
