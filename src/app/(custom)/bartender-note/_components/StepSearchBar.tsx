import { Search } from 'lucide-react';
import UnderlineSearchBar from '@/components/feature/Search/UnderlineSearchBar';

interface Props {
  value: string;
  placeholder: string;
  onValueChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export default function StepSearchBar({
  value,
  placeholder,
  onValueChange,
  onSearch,
}: Props) {
  return (
    <div className="sticky -top-14 z-10 -mx-20 -mt-14 bg-bg-layer-default px-20 pt-14">
      <UnderlineSearchBar
        value={value}
        onValueChange={onValueChange}
        onSearch={onSearch}
        placeholder={placeholder}
        ariaLabel="검색어 입력"
        inputClassName="pr-64"
        clearable
        renderActions={({ submit }) => (
          <button
            type="button"
            aria-label="검색"
            className="flex h-24 w-24 items-center justify-center rounded-sm text-fg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
            onClick={submit}
          >
            <Search aria-hidden className="h-20 w-20" />
          </button>
        )}
      />
    </div>
  );
}
