'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { MfdsApi } from '@/api/mfds/mfds.api';
import { ROUTES } from '@/constants/routes';
import ImportClearanceCompactItem from '@/app/(primary)/import-clearance/_components/ImportClearanceCompactItem';
import { SECTION_HEADING_GAP_CLASS } from '../_constants';

const LIMIT = 3;

interface Props {
  alcoholId: number;
  korName: string;
}

/**
 * 위스키 상세의 보조 섹션. 매칭이 확정된 수입 신고만 조회한다.
 * 별도 조회라 실패하거나 내역이 없으면 섹션 자체를 숨긴다.
 */
export default function AlcoholImportClearance({ alcoholId, korName }: Props) {
  const { data } = useQuery({
    queryKey: ['mfds.alcohols', 'byAlcohol', alcoholId, LIMIT],
    queryFn: async () =>
      (await MfdsApi.getAlcohols({ alcoholId, size: LIMIT + 1 })).data,
    enabled: Boolean(alcoholId),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (!data || data.length === 0) return null;

  const hasMore = data.length > LIMIT;
  const items = data.slice(0, LIMIT);

  return (
    <section className="mx-5 border-b border-stroke-neutral-subtle py-[20px]">
      <h2 className="text-11 font-bold text-fg-neutral">수입 정보</h2>
      <div className={SECTION_HEADING_GAP_CLASS}>
        {items.map((item) => (
          <ImportClearanceCompactItem key={item.id} item={item} />
        ))}
      </div>
      {hasMore && (
        <Link
          href={`${ROUTES.IMPORT_CLEARANCE.BASE}?keyword=${encodeURIComponent(korName)}`}
          className="mt-2 flex items-center justify-center gap-1 py-2 text-12 font-semibold text-fg-brand"
        >
          전체 수입 내역 보기
          <ChevronRight size={14} aria-hidden />
        </Link>
      )}
    </section>
  );
}
