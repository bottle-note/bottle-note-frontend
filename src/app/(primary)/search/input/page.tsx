'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import SearchBar from '@/components/feature/Search/SearchBar';
import RecentSearch from '@/components/feature/Search/RecentSearch';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import { ROUTES } from '@/constants/routes';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const SearchHistory = new SearchHistoryService();

  // returnUrl에서 keyword 파라미터 추출
  const initialKeyword = returnUrl
    ? new URL(returnUrl, window.location.origin).searchParams.get('keyword') ||
      ''
    : '';

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (returnUrl) {
      // returnUrl이 있으면 해당 페이지로 돌아가면서 keyword 전달
      const url = new URL(returnUrl, window.location.origin);

      if (trimmedValue) {
        SearchHistory.save(value);
        url.searchParams.set('keyword', trimmedValue);
      } else {
        // 빈 검색어면 keyword 파라미터 제거
        url.searchParams.delete('keyword');
      }

      router.push(url.pathname + url.search);
      return;
    }

    // returnUrl이 없으면 기본 검색 페이지로
    if (!trimmedValue) {
      router.push(ROUTES.SEARCH.BASE);
      return;
    }

    SearchHistory.save(value);
    router.push(`${ROUTES.SEARCH.BASE}?keyword=${encodeURIComponent(value)}`);
  };

  return (
    <motion.main
      className="w-full pt-[70px] min-h-screen bg-white"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3 px-5">
        <button
          onClick={() => router.back()}
          className="flex-shrink-0"
          aria-label="뒤로가기"
        >
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="뒤로가기"
            width={23}
            height={23}
          />
        </button>
        <div className="flex-1">
          <SearchBar
            handleSearch={onSearch}
            placeholder="어떤 술을 찾고 계신가요?"
            initialValue={initialKeyword}
          />
        </div>
      </div>

      <div className="mt-5">
        <RecentSearch handleSearch={onSearch} />
      </div>
    </motion.main>
  );
}
