import { useQuery } from '@tanstack/react-query';
import { MfdsApi } from '@/api/mfds/mfds.api';

const LIMIT = 3;

/**
 * 매칭이 확정된 수입 신고를 최대 LIMIT개 조회한다. AlcoholImportClearance가
 * 렌더용으로 쓰고, 부모 페이지도 같은 쿼리키로 호출해 "이 섹션이 실제로
 * 보일지"를 미리 알아내 앞 섹션들의 border 노출 여부를 정한다(중복 요청 아님
 * — react-query가 같은 쿼리키를 캐시로 공유한다).
 */
export function useAlcoholImportClearanceItems(alcoholId: number | null) {
  const { data } = useQuery({
    queryKey: ['mfds.alcohols', 'byAlcohol', alcoholId, LIMIT],
    queryFn: async () =>
      (
        await MfdsApi.getAlcohols({
          alcoholId: alcoholId as number,
          size: LIMIT + 1,
        })
      ).data,
    enabled: alcoholId !== null,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (!data || data.length === 0) {
    return { items: null, hasMore: false };
  }

  return { items: data.slice(0, LIMIT), hasMore: data.length > LIMIT };
}
