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

/** 리뷰 작성 단계의 한 줄 입력 칸. 검색 칸과 같은 높이·테두리·포커스 표시를 쓴다. */
export const reviewTextInput =
  'h-44 w-full rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-12 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring';

/** 입력 칸 위에 두는 항목 이름. 선택 입력이면 회색으로 (선택)을 붙인다. */
export function ReviewFieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor?: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="text-13 font-bold text-fg-neutral" htmlFor={htmlFor}>
      {children}
      {optional && (
        <span className="font-normal text-fg-neutral-muted"> (선택)</span>
      )}
    </label>
  );
}

/** 둘 중 하나를 고르는 칸. 잔·병 단위와 공개 범위가 같이 쓴다. */
export function ReviewSegmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
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
