import type { InputHTMLAttributes, ReactNode } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';

/** 리뷰 작성 단계의 태그·키워드 칩. 모바일에서 읽기 쉽게 14px로 둔다. */
const chipBase =
  'inline-flex min-h-32 items-center gap-2 rounded-md border px-10 py-5 text-14 leading-20';

export const reviewChip = {
  selected: `${chipBase} border-stroke-brand-solid bg-bg-brand-weak text-fg-brand`,
  idle: `${chipBase} border-stroke-neutral-subtle bg-transparent text-fg-neutral-muted`,
  add: `${chipBase} border-stroke-brand-solid bg-transparent text-fg-brand`,
};

/** 일반 리뷰 작성의 선택 항목(장소·가격)과 같은 제목. 아이콘 옆에 이름과 (선택)을 둔다. */
export function OptionTitle({
  iconSrc,
  children,
}: {
  iconSrc: string;
  children: ReactNode;
}) {
  return (
    <h3 className="m-0 flex items-center gap-4 text-15 font-bold text-fg-neutral">
      <Image src={iconSrc} alt="" width={20} height={20} />
      {children}
      <span className="text-13 font-normal text-fg-neutral-muted">(선택)</span>
    </h3>
  );
}

/** 둘 중 하나를 고르는 칸. 잔·병 단위와 공개 범위가 같이 쓴다. value가 null이면 아무것도 고르지 않은 상태다. */
export function ReviewSegmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-4 rounded-lg bg-bg-neutral-weak p-4"
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className="min-h-40 rounded-md text-13 text-fg-neutral-muted aria-pressed:bg-bg-brand-weak aria-pressed:font-bold aria-pressed:text-fg-brand"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

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
