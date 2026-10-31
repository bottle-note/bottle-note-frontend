import type { InputHTMLAttributes, ReactNode } from 'react';
import { Search } from 'lucide-react';

/** 리뷰 작성 단계의 태그·키워드 칩. 모바일에서 읽기 쉽게 14px로 둔다. */
const chipBase =
  'inline-flex min-h-32 items-center gap-2 rounded-md border px-10 py-5 text-14 leading-20';

export const reviewChip = {
  selected: `${chipBase} border-stroke-brand-solid bg-bg-brand-weak text-fg-brand`,
  idle: `${chipBase} border-stroke-neutral-subtle bg-transparent text-fg-neutral-muted`,
  add: `${chipBase} border-stroke-brand-solid bg-transparent text-fg-brand`,
};

/** 대화 입력창처럼 테두리를 두르고 왼쪽에 돋보기를 둔 검색 칸. 오른쪽에 등록 같은 행동을 붙일 수 있다. */
export function ReviewSearchField({
  trailing,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & { trailing?: ReactNode }) {
  return (
    <div className="flex h-44 items-center gap-8 rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-12 focus-within:border-stroke-focus-ring focus-within:ring-2 focus-within:ring-stroke-focus-ring has-[:disabled]:opacity-45">
      <Search
        aria-hidden="true"
        className="h-18 w-18 shrink-0 text-fg-neutral-muted"
      />
      <input
        type="search"
        {...inputProps}
        className="h-full min-w-0 flex-1 bg-transparent text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder"
      />
      {trailing}
    </div>
  );
}
