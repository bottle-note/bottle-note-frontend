import { useQuery } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholDetailsResponse } from '@/api/alcohol/types';

export const alcoholDetailKeys = {
  detail: (alcoholId: string, viewerId: number | null) =>
    ['alcoholDetail', alcoholId, viewerId] as const,
};

/** 상세를 보여 주기 전에 미리 받아 둘 때도 같은 조회를 쓴다. */
export const fetchAlcoholDetail = async (
  alcoholId: string,
): Promise<AlcoholDetailsResponse> =>
  (await AlcoholsApi.getAlcoholDetails(alcoholId)).data;

interface UseAlcoholDetailQueryOptions {
  alcoholId: string;
  viewerId: number | null;
  initialData?: AlcoholDetailsResponse;
  enabled: boolean;
}

export function useAlcoholDetailQuery({
  alcoholId,
  viewerId,
  initialData,
  enabled,
}: UseAlcoholDetailQueryOptions) {
  return useQuery({
    queryKey: alcoholDetailKeys.detail(alcoholId, viewerId),
    queryFn: () => fetchAlcoholDetail(alcoholId),
    enabled: enabled && Boolean(alcoholId),
    initialData,
    // 상세 진입마다 브라우저 조회를 한 번 유지하고, 캐시는 그동안 화면에 사용한다.
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // 세션 복원이 끝나 enabled가 켜질 때도 initialData를 갱신한다.
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
}
