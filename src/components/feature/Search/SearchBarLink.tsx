'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import SearchBar from './SearchBar';

interface Props {
  placeholder?: string;
  keyword?: string;
  returnUrl?: string;
  onClear?: () => void;
  /** 검색 페이지 대신 다른 검색 화면을 연다. */
  onOpen?: () => void;
  ariaLabel?: string;
  className?: string;
}

export default function SearchBarLink({
  placeholder = '어떤 술을 찾고 계신가요?',
  keyword,
  returnUrl,
  onClear,
  onOpen,
  ariaLabel,
  className,
}: Props) {
  const router = useRouter();

  const handleNavigate = () => {
    if (onOpen) {
      onOpen();
      return;
    }
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (returnUrl) params.set('returnUrl', returnUrl);

    const queryString = params.toString();
    const targetUrl = queryString
      ? `${ROUTES.SEARCH.INPUT}?${queryString}`
      : ROUTES.SEARCH.INPUT;
    router.push(targetUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 안쪽 지우기 버튼의 키 입력은 그 버튼이 처리한다
    if (e.target !== e.currentTarget) return;
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
      aria-label={ariaLabel}
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
