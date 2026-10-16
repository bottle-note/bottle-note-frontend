import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { MyBottleApi } from '@/api/my-bottle/my-bottle.api';
import type { PickMyBottleItem } from '@/api/my-bottle/types';
import { useAuthSession } from '@/hooks/auth/useAuthSession';

export type PickedAlcohol = PickMyBottleItem['baseMyBottleInfo'];

/** 바텐더 노트에서 한 번에 보여 줄 찜 수. 더 있으면 hasMore로 알린다. */
const PICK_PAGE_SIZE = 30;

/**
 * 로그인한 사용자의 서버 찜 목록과 찜 토글.
 * 토글 결과가 목록에 반영되기 전까지는 누른 상태를 먼저 보여 준다.
 */
export function useBartenderPicks() {
  const { user } = useAuthSession();
  const userId = user?.userId;
  const queryClient = useQueryClient();
  const queryKey = ['bartender-note', 'picks', userId];
  const [pending, setPending] = useState<Record<number, boolean>>({});

  const picks = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await MyBottleApi.getPicks({
        userId: userId as number,
        params: { size: PICK_PAGE_SIZE },
      });
      return {
        items: response.data.myBottleList.map((item) => item.baseMyBottleInfo),
        hasMore: response.meta.pagination?.hasNext ?? false,
      };
    },
    enabled: userId !== undefined,
  });

  const mutation = useMutation({
    mutationFn: ({
      alcoholId,
      picked,
    }: {
      alcoholId: number;
      picked: boolean;
    }) => AlcoholsApi.putPick({ alcoholId, isPicked: picked }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ['my-bottle'] }),
      ]),
    onSettled: (_data, _error, { alcoholId }) =>
      setPending((current) => {
        const next = { ...current };
        delete next[alcoholId];
        return next;
      }),
  });

  const items = picks.data?.items ?? [];
  const isPicked = (alcoholId: number) =>
    pending[alcoholId] ?? items.some((item) => item.alcoholId === alcoholId);

  const toggle = async (alcoholId: number) => {
    const picked = !isPicked(alcoholId);
    setPending((current) => ({ ...current, [alcoholId]: picked }));
    await mutation.mutateAsync({ alcoholId, picked });
    return picked;
  };

  return {
    items,
    hasMore: picks.data?.hasMore ?? false,
    isPicked,
    toggle,
    isToggling: mutation.isPending,
  };
}
