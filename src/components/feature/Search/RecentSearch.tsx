'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SearchHistoryService } from '@/lib/SearchHistoryService';

interface Props {
  handleSearch: (keyword: string) => void;
  keyValue?: string;
}

export default function RecentSearch({ handleSearch, keyValue }: Props) {
  const SearchHistory = new SearchHistoryService(keyValue);
  const [list, setList] = useState(SearchHistory.get());

  const handleDeleteAll = () => {
    SearchHistory.removeAll();
    setList(SearchHistory.get());
  };

  const handleDeleteOne = (e: React.MouseEvent, keyword: string) => {
    e.preventDefault();
    SearchHistory.removeOne(keyword);
    setList(SearchHistory.get());
  };

  return (
    <section className="content-container h-full bg-bg-layer-default px-5 text-fg-neutral">
      <h2 className="text-sm font-bold text-fg-brand">최근 검색어</h2>
      <article className="my-3 border-t border-stroke-brand-weak text-xs">
        {list.map((text) => (
          <article
            className="flex items-center justify-between border-b border-stroke-brand-weak py-3 text-fg-brand"
            key={text}
          >
            <span className="w-full" onMouseDown={() => handleSearch(text)}>
              {text}
            </span>
            <button
              type="button"
              aria-label={`${text} 검색 기록 삭제`}
              onMouseDown={(e) => handleDeleteOne(e, text)}
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </article>
        ))}
      </article>

      <article className="flex flex-col items-start gap-2">
        {list.length === 0 && (
          <span className="text-xs text-fg-neutral-muted">
            최근 검색어가 없습니다.
          </span>
        )}
      </article>

      {list.length > 0 && (
        <button
          type="button"
          className="text-10 text-fg-neutral-muted"
          onMouseDown={handleDeleteAll}
        >
          전체기록삭제
        </button>
      )}
    </section>
  );
}
