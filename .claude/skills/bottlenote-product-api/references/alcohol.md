# Alcohol / Whisky API

Source: https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html

## 술 검색

### 술 목록 조회

- **GET** `/api/v1/alcohols/search`
- Query: `keyword?`, `curationId?`, `category?` (SINGLE_MALT|BLEND|BOURBON|RYE|OTHER), `regionId?`, `sortType?` (POPULAR|RATING|PICK|REVIEW, default: POPULAR), `sortOrder?` (DESC|ASC), `cursor?` (default: 0), `pageSize?` (default: 10)
- Response:

```typescript
{
  totalCount: number;
  alcohols: {
    alcoholId: number;
    korName: string;
    engName: string;
    korCategoryName: string;
    engCategoryName: string;
    imageUrl: string | null;
    rating: number;
    ratingCount: number;
    reviewCount: number;
    pickCount: number;
    isPicked: boolean;
  }
  [];
}
```

### 술 상세 조회

- **GET** `/api/v1/alcohols/{alcoholsId}`
- Path: `alcoholsId: number`
- Response:

```typescript
{
  alcohols: {
    alcoholId: number;
    korName: string;
    engName: string;
    korCategoryName: string;
    engCategoryName: string;
    imageUrl: string | null;
    korRegionName: string;
    engRegionName: string;
    korDistilleryName: string;
    engDistilleryName: string;
    abv: string | null;
    age: string | null;
    cask: string | null;
    rating: number;
    totalRatingsCount: number;
    myRating: number | null;
    myAvgRating: number | null;
    isPicked: boolean;
    tastingTags: { tagId: number; tagName: string }[];
  };
  friendsInfo: {
    followerCount: number;
    friendRatings: { userId: number; nickName: string; imageUrl: string; rating: number }[];
  };
  reviewInfo: {
    totalReviewCount: number;
    reviews: ReviewSummary[];
  };
}
```

## 찜하기

### 찜하기/해제

- **PUT** `/api/v1/picks` (Auth required)
- Request: `{ alcoholId: number, isPicked: "PICK" | "UNPICK" }`
- Response: `{ message: string, status: string }`

## 카테고리 & 지역

### 카테고리 목록 조회

- **GET** `/api/v1/alcohols/categories`
- Query: `type?` (e.g. "WHISKY")
- Response: `{ korCategory: string, engCategory: string, categoryGroup: string }[]`

### 지역 목록 조회

- **GET** `/api/v1/regions`
- Response: `{ regionId: number, korName: string, engName: string, description: string }[]`

## 큐레이션

### 큐레이션 목록 조회

- **GET** `/api/v1/curations`
- Query: `keyword?`, `alcoholId?`, `cursor?` (default: 0), `pageSize?` (default: 10)
- Response:

```typescript
{
  items: {
    id: number;
    name: string;
    description: string;
    coverImageUrl: string;
    alcoholCount: number;
    displayOrder: number;
  }
  [];
}
```

### 큐레이션별 위스키 목록

- **GET** `/api/v1/curations/{curationId}/alcohols`
- Path: `curationId: number`
- Query: `cursor?`, `pageSize?`
- Response: 술 목록 조회와 동일한 alcohol 배열 구조

## 인기

### 주간 인기 위스키

- **GET** `/api/v1/popular/week`

### 봄 시즌 인기 위스키

- **GET** `/api/v1/popular/spring`

### 주간 조회수 인기

- **GET** `/api/v1/popular/view/week`

### 월간 조회수 인기

- **GET** `/api/v1/popular/view/monthly`

## 탐색 (Explore)

### 위스키 탐색

> 검색(`/alcohols/search`)을 흡수한 메인 탐색 엔드포인트 (백엔드 PR #577, merged).
> Source: `ExploreStandardRequest.java`, `AlcoholExploreController.java`, `SearchSortType.java`

- **GET** `/api/v1/alcohols/explore/standard`
- Query:
  - `keywords?: string[]` — 다중 키워드. 키워드 간 **AND**, 각 키워드는 여러 필드와 OR 매칭
  - `category?: AlcoholCategoryGroup`
  - `regionIds?: number[]` — 컬렉션 내 OR (IN 절). search API의 단수 `regionId`와 다름
  - `distilleryIds?: number[]` — 컬렉션 내 OR
  - `curationId?: number`
  - `sortType?: "POPULAR" | "RATING" | "PICK" | "REVIEW" | "RANDOM"` (default: `RANDOM`)
  - `sortOrder?: "DESC" | "ASC"` (default: `DESC`)
  - `seed?: number` (Long) — RANDOM 정렬 페이지 간 순서 일관성용. 미전송 시 서버가 생성하여 응답 `meta.seed`에 실어 내려줌. 다음 페이지 요청에 동일 seed 전달 필수. **비-RANDOM 정렬에서는 무시 (서비스가 0으로 채워 응답)**
  - `cursor?: number` (default: 0, `>= 0`)
  - `size?: number` (default: 20, `1 ~ 100`)
- 서로 다른 필터 간 결합은 **AND**

- Response (`GlobalResponse<CollectionResponse<AlcoholDetailItem>>`):

```typescript
{
  success: boolean;
  code: number;
  data: {
    totalCount: 0;  // ⚠️ 컨트롤러에서 항상 0으로 고정 전달 — 실제 총개수 제공 안 됨
    items: AlcoholDetailItem[];  // reviewCount, pickCount 포함 (PR #577에서 추가)
  };
  meta: {
    pageable: { currentCursor, cursor, pageSize, hasNext };
    searchParameters: ExploreStandardRequest;  // 요청 그대로 echo
    seed: number;  // RANDOM 정렬 시 사용된 seed (요청값 또는 서버 생성값), 비-RANDOM은 0
  };
}
```

- 인증: **선택적**. 컨트롤러는 `SecurityContextUtil.getUserIdByContext().orElse(-1L)`로 처리 — 비로그인은 `userId = -1`. Authorization 헤더 없어도 호출 가능, 단 `isPicked` 등 사용자 컨텍스트 필드는 로그인 시에만 의미 있는 값

### 리뷰 탐색

- **GET** `/api/v1/reviews/explore/standard`
- Query: `keywords?: string[]`, `cursor?: number`, `size?: number`
- Response:

```typescript
{
  totalCount: number;
  items: ExploreReview[]; // userInfo, alcoholName, reviewContent, reviewRating, isLikedByMe 등
}
```

- Meta: `meta.pageable` (cursor 기반)
- 인증: **문서에 명시 없음** (`isMyReview`, `isLikedByMe`는 로그인 시 제공)

## 테이스팅 태그

### 문장에서 태그 추출

- **GET** `/api/v1/tasting-tags/extract`
- Query: `text: string`
- Response: `string[]` (태그명 배열)
