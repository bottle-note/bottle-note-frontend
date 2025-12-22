$ARGUMENTS 기능에 대한 API 호출 함수와 TanStack Query 훅을 생성해주세요.

이 프로젝트의 API 패턴:

### 1. API 함수 (src/lib/)
```tsx
// src/lib/xxxApi.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const xxxApi = {
  getList: async (params: ListParams): Promise<ListResponse> => {
    const res = await fetch(`${API_BASE}/xxx?${new URLSearchParams(params)}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },

  getById: async (id: string): Promise<ItemResponse> => {
    const res = await fetch(`${API_BASE}/xxx/${id}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },

  create: async (data: CreateData): Promise<ItemResponse> => {
    const res = await fetch(`${API_BASE}/xxx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create');
    return res.json();
  },
};
```

### 2. Query 훅 (src/queries/ 또는 src/hooks/)
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useXxxList = (params: ListParams) => {
  return useQuery({
    queryKey: ['xxx', 'list', params],
    queryFn: () => xxxApi.getList(params),
  });
};

export const useXxxDetail = (id: string) => {
  return useQuery({
    queryKey: ['xxx', 'detail', id],
    queryFn: () => xxxApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateXxx = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: xxxApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xxx'] });
    },
  });
};
```

사용 예시:
- `/api review` - 리뷰 API 및 쿼리 훅 생성
- `/api whiskey` - 위스키 API 및 쿼리 훅 생성
- `/api user` - 사용자 API 및 쿼리 훅 생성
