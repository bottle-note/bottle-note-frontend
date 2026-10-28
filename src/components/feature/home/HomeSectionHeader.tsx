import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  label: string;
  /** 줄바꿈(\n)으로 두 줄 제목을 나눈다. */
  title: string;
  moreHref?: string;
  moreLabel?: string;
  onMoreClick?: () => void;
}

/** 홈 섹션 머리: 브랜드색 라벨, 두 줄 제목, 선택적인 「전체 보기」 링크 */
export default function HomeSectionHeader({
  label,
  title,
  moreHref,
  moreLabel = '전체 보기',
  onMoreClick,
}: Props) {
  return (
    <header className="flex items-end justify-between gap-12 px-20">
      <div>
        <p className="pb-10 text-13 font-extrabold text-fg-brand-primary">
          {label}
        </p>
        <h2 className="whitespace-pre-line text-20 font-bold leading-28 text-fg-neutral">
          {title}
        </h2>
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          onClick={onMoreClick}
          className="flex min-h-44 shrink-0 items-center gap-2 text-13 text-fg-neutral-muted"
        >
          {moreLabel}
          <ArrowUpRight aria-hidden size={14} />
        </Link>
      )}
    </header>
  );
}
