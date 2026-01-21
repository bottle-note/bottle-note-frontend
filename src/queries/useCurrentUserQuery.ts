import { useQuery } from '@tanstack/react-query';
import { UserApi } from '@/api/user/user.api';
import type { CurrentUserInfo } from '@/api/user/types';

// Query Key 팩토리
export const currentUserKeys = {
  all: ['currentUser'] as const,
  info: () => [...currentUserKeys.all, 'info'] as const,
};

interface UseCurrentUserQueryOptions {
  enabled?: boolean;
}

/**
 * 현재 로그인한 사용자 정보를 조회하는 훅
 */
export const useCurrentUserQuery = ({
  enabled = true,
}: UseCurrentUserQueryOptions = {}) => {
  return useQuery({
    queryKey: currentUserKeys.info(),
    queryFn: async (): Promise<CurrentUserInfo> => {
      const response = await UserApi.getCurUserInfo();
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5분 캐시
    gcTime: 1000 * 60 * 30, // 30분 GC
    retry: false,
  });
};
