import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  label: string;
  /** 한 줄로 보여준다. 닉네임처럼 길이가 바뀌는 문구가 넘치면 끝을 말줄임한다. */
  title: string;
  moreHref?: string;
  moreLabel?: string;
  onMoreClick?: () => void;
}

/** 섹션 머리: 브랜드색 라벨과 선택적인 「전체 보기」 링크를 한 줄에, 그 아래 한 줄 제목 */
export default function SectionHeader({
  label,
  title,
  moreHref,
  moreLabel = '전체 보기',
  onMoreClick,
}: Props) {
  return (
    <header className="px-20">
      <div className="flex min-h-44 items-center justify-between gap-12">
        <p className="text-13 font-extrabold text-fg-brand-primary">{label}</p>
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
      </div>
      <h2 className="truncate text-20 font-bold leading-28 text-fg-neutral">
        {title}
      </h2>
    </header>
  );
}
