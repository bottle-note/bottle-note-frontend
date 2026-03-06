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

- **GET** `/api/v1/alcohols/explore/standard`

### 리뷰 탐색

- **GET** `/api/v1/reviews/explore/standard`

## 테이스팅 태그

### 문장에서 태그 추출

- **GET** `/api/v1/tasting-tags/extract`
- Query: `text: string`
- Response: `string[]` (태그명 배열)
