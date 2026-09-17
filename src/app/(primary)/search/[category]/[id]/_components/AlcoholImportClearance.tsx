'use client';

import { useQuery } from '@tanstack/react-query';
import { MfdsApi } from '@/api/mfds/mfds.api';
import ImportClearanceCompactItem from '@/app/(primary)/import-clearance/_components/ImportClearanceCompactItem';
import { PROCESSED_DATE_NOTICE } from '@/app/(primary)/import-clearance/_lib/declaration';

const LIMIT = 3;

interface Props {
  alcoholId: number;
}

/**
 * 위스키 상세의 보조 섹션. 매칭이 확정된 수입 신고만 조회한다.
 * 별도 조회라 실패하거나 내역이 없으면 섹션 자체를 숨긴다.
 */
export default function AlcoholImportClearance({ alcoholId }: Props) {
  const { data } = useQuery({
    queryKey: ['mfds.alcohols', 'byAlcohol', alcoholId, LIMIT],
    queryFn: async () =>
      (await MfdsApi.getAlcohols({ alcoholId, size: LIMIT })).data,
    enabled: Boolean(alcoholId),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="mx-5 pb-24 pt-5">
      <h2 className="text-13 font-bold text-fg-neutral">수입 정보</h2>
      <div className="pt-1">
        {data.map((item) => (
          <ImportClearanceCompactItem key={item.id} item={item} />
        ))}
      </div>
      <p className="pt-2 text-11 text-fg-neutral-muted">
        {PROCESSED_DATE_NOTICE}
      </p>
    </section>
  );
}
