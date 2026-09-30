import UnderlineSearchBar from '@/components/feature/Search/UnderlineSearchBar';
import BottleCard from './BottleCard';
import { BOTTLES } from '../_lib/experience';
import styles from '../bartender.module.css';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  selected?: number[];
  onSelect: (id: number) => void;
}

export default function BottleSearch({
  query,
  onQueryChange,
  selected,
  onSelect,
}: Props) {
  const keyword = query.trim().toLocaleLowerCase();
  const results = BOTTLES.filter((bottle) =>
    `${bottle.name} ${bottle.category}`.toLocaleLowerCase().includes(keyword),
  );
  return (
    <div className={styles.stack}>
      <UnderlineSearchBar
        value={query}
        onValueChange={onQueryChange}
        placeholder="위스키 이름 검색"
        ariaLabel="위스키 이름 검색"
        clearable
        inputClassName="pr-32 text-16"
      />
      {selected && (
        <p className={styles.hint} aria-live="polite">
          {selected.length} / 3병 선택 · 다시 누르면 선택이 해제돼요.
        </p>
      )}
      {!keyword && (
        <p className={styles.hint}>이름이 익숙한 위스키를 골라 보세요.</p>
      )}
      {selected && selected.length > 0 && (
        <div className={styles.chips}>
          {selected.map((id) => (
            <button
              type="button"
              key={id}
              className={`${styles.chip} ${styles.chipSelected}`}
              onClick={() => onSelect(id)}
              aria-label={`${BOTTLES.find((bottle) => bottle.id === id)?.name} 선택 해제`}
            >
              {BOTTLES.find((bottle) => bottle.id === id)?.name} ×
            </button>
          ))}
        </div>
      )}
      {results.slice(0, keyword ? 12 : 6).map((bottle) => (
        <BottleCard
          key={bottle.id}
          bottle={bottle}
          onClick={() => onSelect(bottle.id)}
          selected={selected?.includes(bottle.id)}
          disabled={
            !!selected && selected.length >= 3 && !selected.includes(bottle.id)
          }
        />
      ))}
      {results.length === 0 && (
        <p role="status" className={styles.hint}>
          미리보기 목록에 없는 위스키예요. 다른 이름으로 찾아보세요.
        </p>
      )}
    </div>
  );
}
