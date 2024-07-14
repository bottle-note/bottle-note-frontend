'use client';

import SearchBar from '@/components/SearchBar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import RecentSearch from '../../_components/RecentSearch';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import { useBlockScroll } from '@/hooks/useBlockScroll';

// TODO: 여기엔 어떤 기능이 있어야할까~요~??
// 검색어 핸들러 함수를 인자로 받아와야한다. v
// 최근 검색어 목록을 로컬 스토리지에서 불러온다.v
// 불러온 목록을 클릭하면 검색어 핸들러 함수를 실행한다. v
// 전체 기록을 삭제할 수 있다. v
// 개별 기록을 삭제할 수 있다. v
// 최근 검색어 리스트 아이템을 클릭해 검색을 한 경우, 현재 검색창에 입력된 value 값도 그 값으로 바뀐다.
// 중복된 최근 검색어가 있을 경우엔 중복을 제거하여 저장한다. v

interface Props {
  handleSearch: (value: string) => void;
}

function SearchContainer({ handleSearch }: Props) {
  const paths = usePathname().split('/');
  const { handleScroll } = useBlockScroll();
  const [isOnSearch, setIsOnSearch] = useState(false);
  const SearchHistory = new SearchHistoryService();

  const onSearch = (value: string) => {
    handleSearch(value);
    SearchHistory.save(value);
    setIsOnSearch(false);
  };

  useEffect(() => {
    if (isOnSearch) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return handleScroll({ isScroll: false });
    }

    return handleScroll({ isScroll: true });
  }, [isOnSearch]);

  return (
    <>
      <div className="px-5 pt-[76px] pb-6 bg-subCoral relative">
        <SearchBar
          handleSearch={onSearch}
          handleFocus={(status) => setIsOnSearch(status)}
        />
      </div>

      {isOnSearch && (
        <div className="absolute w-full h-full z-10 p-5">
          <RecentSearch />
        </div>
      )}
    </>
  );
}

export default SearchContainer;
