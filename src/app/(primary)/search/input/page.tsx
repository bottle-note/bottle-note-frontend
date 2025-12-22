'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SearchBar from '@/components/feature/Search/SearchBar';
import RecentSearch from '@/components/feature/Search/RecentSearch';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import { ROUTES } from '@/constants/routes';

export default function SearchInput() {
  const router = useRouter();
  const SearchHistory = new SearchHistoryService();

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

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
          />
        </div>
      </div>

      <div className="mt-5">
        <RecentSearch handleSearch={onSearch} />
      </div>
    </motion.main>
  );
}
