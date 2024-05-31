/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import RecentSearch from '../_components/RecentSearch';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const paths = usePathname().split('/');
  const [isOnFocus, setIsOnFocus] = useState(false);

  const handleSearch = (value: string) => {
    console.log(value);
    // TODO: api call here
    // 여기서 api 호출이 일어나면, category 그러니까 children 의 데이터가 바뀌어야 함.
    // 이걸 여기서 담당하는게 맞는건가? 라는 의문이 드는군...
    // 이 검색 페이지 전체적으로 뭔가 구조가 딱딱 맞아 돌아가게끔 예쁘게 설계를 해야할 필요성이 느껴진다...!
  };

  if (paths.length > 3) return <>{children}</>;

  return (
    <main className="mb-24 w-full h-full">
      <div
        className="px-5 pt-[76px] pb-6 bg-subCoral"
        onClick={() => setIsOnFocus(true)}
      >
        <SearchBar handleSearch={handleSearch} />
      </div>

      <section className="p-5 space-y-7">
        {isOnFocus ? <RecentSearch /> : children}
      </section>
    </main>
  );
}
