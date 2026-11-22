import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  title: string;
  moreHref?: string;
  moreLabel?: string;
  onMoreClick?: () => void;
}

/** 섹션 머리: 제목과 선택적인 「전체 보기」 링크를 한 줄에 둔다. 제목이 길면 두 줄까지 보여준다. */
export default function SectionHeader({
  title,
  moreHref,
  moreLabel = '전체 보기',
  onMoreClick,
}: Props) {
  return (
    <header className="flex min-h-44 items-center justify-between gap-12 px-20">
      <h2 className="line-clamp-2 break-keep text-20 font-bold leading-28 text-fg-neutral">
        {title}
      </h2>
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
