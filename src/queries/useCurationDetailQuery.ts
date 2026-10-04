import { useQuery } from '@tanstack/react-query';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import type { CurationV2DetailItem } from '@/api/curation-v2/types';
import { curationV2Keys } from '@/queries/curationV2Keys';

export const useCurationDetailQuery = (
  curationId?: string | number,
  initialData?: CurationV2DetailItem,
) => {
  return useQuery({
    queryKey: curationV2Keys.detail(curationId ?? ''),
    queryFn: async (): Promise<CurationV2DetailItem> => {
      const response = await CurationV2Api.getDetail(curationId as string);
      return response.data;
    },
    enabled: Boolean(curationId),
    initialData,
    // 서버가 렌더링한 공개 데이터를 먼저 보여주되, 실제 방문의 브라우저 조회는 유지한다.
    refetchOnMount: initialData ? 'always' : undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
};
