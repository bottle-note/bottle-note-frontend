'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import NavLayout, { useNavLayout } from '@/components/ui/Layout/NavLayout';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import Tab from '@/components/ui/Navigation/Tab';
import { useTab } from '@/hooks/useTab';
import { ROUTES } from '@/constants/routes';

const tabList = [
  { id: 'clearance', name: '수입통관' },
  { id: 'importer', name: '수입사' },
];

export function ImportClearanceNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const currentTabId = tab === 'importer' ? 'importer' : 'clearance';
  const currentTabObj =
    tabList.find((t) => t.id === currentTabId) || tabList[0];
  const { refs, registerTab } = useTab({ tabList });

  const handleTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
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

  const isHeaderVisible = !searchParams.has('keyword');

  return (
    <NavLayout showNavbar={pathname === ROUTES.IMPORT_CLEARANCE.BASE}>
      <div className="fixed-content top-0 z-10 bg-bg-layer-default">
        <AutoHideLogoHeader isVisible={isHeaderVisible} sticky={false} />
        <div
          className="scroll-navigation-motion absolute inset-x-0 top-[var(--header-height-with-safe)] transition-transform"
          style={{
            transform: isHeaderVisible
              ? 'translateY(var(--logo-header-slide-distance))'
              : 'translateY(0)',
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
      {children}
    </NavLayout>
  );
}
