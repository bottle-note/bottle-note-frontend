$ARGUMENTS 기능에 대한 API 호출 함수와 TanStack Query 훅을 생성해주세요.

## API 구조 규칙 (중요)

**배럴 파일(index.ts) 사용 금지** - 번들링과 트리셰이킹 최적화를 위해 직접 파일 경로 사용

```
src/api/
├── _shared/
│   ├── types.ts           # ApiResponse 등 공통 타입
│   └── queryBuilder.ts    # 쿼리 파라미터 빌더
├── {domain}/
│   ├── {domain}.api.ts    # API 함수 (예: alcohol.api.ts)
│   └── types.ts           # 도메인별 타입
```

### 1. API 함수 (src/api/{domain}/{domain}.api.ts)

```tsx
// src/api/xxx/xxx.api.ts
import { apiClient } from '@/shared/api/apiClient';
import type { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import type { GetListRequest, GetListResponse, Item } from './types';

export const XxxApi = {
  async getList(params: GetListRequest): Promise<ApiResponse<GetListResponse>> {
    const queryString = buildQueryParams({
      keyword: params.keyword,
      cursor: params.cursor,
      pageSize: params.pageSize,
    });

    return apiClient.get<ApiResponse<GetListResponse>>(
      `/xxx?${queryString}`,
      { authRequired: false }, // 항상 명시
    );
  },

  async getById(id: string): Promise<ApiResponse<Item>> {
    return apiClient.get<ApiResponse<Item>>(`/xxx/${id}`, {
      authRequired: false,
    });
  },

  async create(data: CreateData): Promise<ApiResponse<Item>> {
    return apiClient.post<ApiResponse<Item>>('/xxx', data, {
      authRequired: true,
    });
  },
};
```

### 2. 타입 정의 (src/api/{domain}/types.ts)

```tsx
// src/api/xxx/types.ts
export interface Item {
  id: number;
  name: string;
  // ...
}

export interface GetListRequest {
  keyword?: string;
  cursor?: number;
  pageSize?: number;
}

export interface GetListResponse {
  items: Item[];
  totalCount: number;
}

export interface CreateData {
  name: string;
  // ...
}
```

### 3. Query 훅 (src/queries/ 또는 src/hooks/)

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XxxApi } from '@/api/xxx/xxx.api';
import type { GetListRequest } from '@/api/xxx/types';

export const useXxxList = (params: GetListRequest) => {
  return useQuery({
    queryKey: ['xxx', 'list', params],
    queryFn: async () => {
      const response = await XxxApi.getList(params);
      return response.data; // ApiResponse에서 data 추출
    },
  });
};

export const useXxxDetail = (id: string) => {
  return useQuery({
    queryKey: ['xxx', 'detail', id],
    queryFn: async () => {
      const response = await XxxApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateXxx = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await XxxApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xxx'] });
    },
  });
};
```

## Import 규칙

```tsx
// ✅ 올바른 방식 - 직접 파일 경로
import { XxxApi } from '@/api/xxx/xxx.api';
import type { Item, GetListRequest } from '@/api/xxx/types';

// ❌ 금지 - 배럴 파일 import
import { XxxApi, Item } from '@/api/xxx';
```

## API 함수 규칙

- 모든 API 함수는 `ApiResponse<T>` 타입 반환
- 사용 시 `response.data`로 실제 데이터 접근
- `authRequired` 옵션 항상 명시
- 에러 메시지는 한글로 통일

사용 예시:

- `/api review` - 리뷰 API 및 쿼리 훅 생성
- `/api whiskey` - 위스키 API 및 쿼리 훅 생성
- `/api user` - 사용자 API 및 쿼리 훅 생성
