import { useState } from 'react';
import { WhiskeyRow } from './WhiskeyRow';
import type { Whiskey } from '../_data/demo';

/** 이름이나 종류에 검색어가 들어간 술. 이름이 검색어로 시작하면 앞에 둔다. */
function searchWhiskies(whiskies: Whiskey[], query: string) {
  const key = query.trim().toLowerCase();
  if (!key) return whiskies;
  return whiskies
    .filter(
      (whiskey) =>
        whiskey.name.toLowerCase().includes(key) ||
        whiskey.category.toLowerCase().includes(key),
    )
    .sort(
      (a, b) =>
        Number(b.name.toLowerCase().startsWith(key)) -
        Number(a.name.toLowerCase().startsWith(key)),
    );
}

/** 리뷰를 남길 술을 검색하거나 많이 찾는 술에서 고른다. */
export default function ReviewPickStep({
  whiskies,
  onPick,
}: {
  whiskies: Whiskey[];
  onPick: (whiskey: Whiskey) => void;
}) {
  const [query, setQuery] = useState('');
  const results = searchWhiskies(whiskies, query);

  return (
    <>
      <input
        className="h-46 w-full rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="마시고 있는 술 이름 검색"
        aria-label="술 이름 또는 종류 검색"
      />
      <p className="m-0 text-13 leading-17 text-fg-neutral-muted">
        {query
          ? `검색 결과 ${results.length}병${results.length > 6 ? ' · 이름을 더 적으면 좁혀져요' : ''}`
          : '또는 많이 찾는 술에서 골라 보세요'}
      </p>
      {!query && (
        <div className="flex flex-wrap gap-6">
          {results.slice(0, 10).map((whiskey) => (
            <button
              type="button"
              key={whiskey.id}
              className="rounded-full border border-stroke-neutral-weak px-10 py-6 text-13 text-fg-neutral"
              onClick={() => onPick(whiskey)}
            >
              {whiskey.name}
            </button>
          ))}
        </div>
      )}
      {query && results.length === 0 && (
        <p className="text-15 text-fg-neutral">
          그 이름으로는 못 찾겠네요. 철자를 조금 바꿔 보시겠어요?
        </p>
      )}
      {query && (
        <div className="flex flex-col">
          {results.slice(0, 6).map((whiskey) => (
            <WhiskeyRow
              key={whiskey.id}
              whiskey={whiskey}
              search
              onClick={() => onPick(whiskey)}
            />
          ))}
        </div>
      )}
    </>
  );
}
