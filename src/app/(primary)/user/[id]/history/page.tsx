'use client';

import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import Tab from '@/components/Tab';
import { HISTORY_TYPES } from '@/constants/user';
import { useTab } from '@/hooks/useTab';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

export default function UserHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyType = searchParams.get('type');

  const { currentTab, handleTab, tabList } = useTab({ tabList: HISTORY_TYPES });

  useEffect(() => {
    const selected = tabList.find((item) => item.id === historyType);

    handleTab(selected?.id ?? 'all');
  }, [historyType]);

  useEffect(() => {
    router.replace(`?type=${currentTab.id}`);
  }, [currentTab]);

  return (
    <main>
      <SubHeader bgColor="bg-bgGray">
        <SubHeader.Left
          onClick={() => {
            router.back();
          }}
        >
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center textColor="text-subCoral">
          마이페이지
        </SubHeader.Center>
      </SubHeader>

      <section className="pt-10 px-5">
        <Tab currentTab={currentTab} handleTab={handleTab} />
      </section>
    </main>
  );
}
