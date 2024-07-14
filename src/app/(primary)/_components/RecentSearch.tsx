'use client';

import { SearchHistoryService } from '@/lib/SearchHistoryService';
import Image from 'next/image';
import DeleteIcon from 'public/icon/close-subcoral.svg';
import { useState } from 'react';

// TODO: 여기에 검색어로 서치 파라미터 추가하는 기능을 넣어줘!!!
export default function RecentSearch() {
  const SearchHistory = new SearchHistoryService();
  const [list, setList] = useState(SearchHistory.get());

  const handleSearch = (keyword: string) => {
    // TODO: 해당 키워드로 현재 서치 파라미터를 변경해야될 필요 있음!
  };

  const handleDeleteAll = () => {
    SearchHistory.removeAll();
    setList(SearchHistory.get());
  };

  const handleDeleteOne = (keyword: string) => {
    SearchHistory.removeOne(keyword);
    setList(SearchHistory.get());
  };

  return (
    <section className=" bg-white w-full h-full z-100">
      <h2 className="text-sm font-bold text-subCoral">최근 검색어</h2>
      <article className="text-xs my-3 border-t border-subCoral">
        {list.map((text, idx) => (
          <article
            className="flex justify-between items-center py-3 text-subCoral border-b border-subCoral"
            key={`${text}_${idx}`}
          >
            <span onClick={() => handleSearch(text)}>{text}</span>
            <button onClick={() => handleDeleteOne(text)}>
              <Image src={DeleteIcon} alt="delete" />
            </button>
          </article>
        ))}
      </article>

      <article className="flex flex-col items-start gap-2">
        {list.length === 0 && (
          <span className="text-xs text-mainGray">최근 검색어가 없습니다.</span>
        )}
      </article>

      {list.length > 0 && (
        <button className="text-xxs text-mainGray" onClick={handleDeleteAll}>
          전체기록삭제
        </button>
      )}
    </section>
  );
}
