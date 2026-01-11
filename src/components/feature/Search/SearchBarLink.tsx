'use client';

import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

interface Props {
  placeholder?: string;
  keyword?: string;
  returnUrl?: string;
  onClear?: () => void;
  className?: string;
}

export default function SearchBarLink({
  placeholder = '어떤 술을 찾고 계신가요?',
  keyword,
  returnUrl,
  onClear,
  className,
}: Props) {
  const router = useRouter();

  const handleNavigate = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', encodeURIComponent(keyword));
    if (returnUrl) params.set('returnUrl', encodeURIComponent(returnUrl));

    const queryString = params.toString();
    const targetUrl = queryString
      ? `/search/input?${queryString}`
      : '/search/input';
    router.push(targetUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      className={`cursor-pointer ${className || ''}`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <SearchBar
        placeholder={placeholder}
        readOnly={true}
        value={keyword || ''}
        onDelete={onClear}
      />
    </div>
  );
}
