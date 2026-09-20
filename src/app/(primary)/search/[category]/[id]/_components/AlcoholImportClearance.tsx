'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import ImportClearanceCompactItem from '@/app/(primary)/import-clearance/_components/ImportClearanceCompactItem';
import { useAlcoholImportClearanceItems } from './useAlcoholImportClearanceItems';
import { SECTION_HEADING_GAP_CLASS } from '../_constants';

interface Props {
  alcoholId: number;
  korName: string;
}

/**
 * 위스키 상세의 보조 섹션. 매칭이 확정된 수입 신고만 조회한다.
 * 별도 조회라 실패하거나 내역이 없으면 섹션 자체를 숨긴다.
 *
 * alcoholMetadataAndTags 안에서 항상 마지막에 오는 섹션이라 border-b를
 * 갖지 않는다 — 앞의 FlavorTags/메타데이터 섹션이 이 섹션의 존재 여부를
 * 보고 자기 자신의 border-b를 낼지 말지 정한다 (page.tsx 참고).
 */
export default function AlcoholImportClearance({ alcoholId, korName }: Props) {
  const { items, hasMore } = useAlcoholImportClearanceItems(alcoholId);

  if (!items) return null;

  return (
    <section className="mx-5 py-[20px]">
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
