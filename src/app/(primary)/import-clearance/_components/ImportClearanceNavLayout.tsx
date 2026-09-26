'use client';

import { usePathname } from 'next/navigation';
import TabbedListPageHeader from '@/components/feature/TabbedListPage/TabbedListPageHeader';
import NavLayout from '@/components/ui/Layout/NavLayout';
import { ROUTES } from '@/constants/routes';
import { useTabbedListNavigation } from '@/hooks/useTabbedListNavigation';

const tabList = [
  { id: 'clearance', name: '수입통관' },
  { id: 'importer', name: '수입사' },
] as const;

const TAB_SCOPED_SEARCH_PARAMS = [
  'keyword',
  'startDate',
  'endDate',
  'country',
  'category',
] as const;

export function ImportClearanceNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isListPage = pathname === ROUTES.IMPORT_CLEARANCE.BASE;
  const { currentTab, handleTabChange } = useTabbedListNavigation({
    tabList,
    defaultTabId: 'clearance',
    resetSearchParams: TAB_SCOPED_SEARCH_PARAMS,
    omitDefaultTabParam: true,
    enabled: isListPage,
  });

  return (
    <NavLayout showNavbar={isListPage}>
      {isListPage ? (
        <TabbedListPageHeader
          tabList={tabList}
          currentTab={currentTab}
          onTabChange={handleTabChange}
        >
          {children}
        </TabbedListPageHeader>
      ) : (
        children
      )}
    </NavLayout>
  );
}
