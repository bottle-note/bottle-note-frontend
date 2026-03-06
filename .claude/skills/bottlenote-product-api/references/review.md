# Review API

Source: https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html

## 리뷰 CRUD

### 리뷰 등록

- **POST** `/api/v1/reviews` (Auth required)
- Request:

```typescript
{
  alcoholId: number;
  content: string;             // 최대 700자
  status?: "PUBLIC" | "PRIVATE"; // default: PUBLIC
  price?: number;
  sizeType?: "GLASS" | "BOTTLE";
  locationInfo?: {
    locationName?: string;
    zipCode?: string;
    address?: string;
    detailAddress?: string;
    category?: string;
    mapUrl?: string;
    latitude?: string;
    longitude?: string;
  };
  imageUrlList?: {
    order: number;
    viewUrl: string;
  }[];
  tastingTagList?: string[];   // 최대 15개, 각 최대 12자
  rating: number;
}
```

- Response: `{ id: number, content: string, callback: string }`

### 리뷰 목록 조회

- **GET** `/api/v1/reviews`
- Query: `alcoholId?`, `cursor?`, `size?`

### 내가 작성한 리뷰 조회

- **GET** `/api/v1/reviews/me` (Auth required)
- Query: `cursor?`, `size?`

### 리뷰 상세 조회

- **GET** `/api/v1/reviews/{reviewId}`
- Path: `reviewId: number`
- Response:

```typescript
{
  reviewId: number;
  reviewContent: string;
  rating: number;
  status: "PUBLIC" | "PRIVATE";
  price: number | null;
  sizeType: string | null;
  createAt: string;
  userInfo: { userId: number; nickName: string; imageUrl: string };
  locationInfo: { ... } | null;
  reviewImageList: { order: number; viewUrl: string }[];
  tastingTagList: string[];
  likeCount: number;
  replyCount: number;
  isMyReview: boolean;
  isLikedByMe: boolean;
  isBestReview: boolean;
}
```

### 리뷰 수정

- **PATCH** `/api/v1/reviews/{reviewId}` (Auth required)
- Path: `reviewId: number`
- Request: 등록과 동일 필드 (모두 optional)

### 리뷰 삭제

- **DELETE** `/api/v1/reviews/{reviewId}` (Auth required)
- Path: `reviewId: number`

### 리뷰 공개/비공개 상태 변경

- **PATCH** `/api/v1/reviews/{reviewId}/status` (Auth required)
- Path: `reviewId: number`
- Request: `{ status: "PUBLIC" | "PRIVATE" }`

## 좋아요

### 리뷰 좋아요

- **POST** `/api/v1/reviews/{reviewId}/like` (Auth required)
- Path: `reviewId: number`
- Request: `{ isLiked: boolean }`

## 댓글 (Reply)

### 댓글 등록

- **POST** `/api/v1/reviews/{reviewId}/replies` (Auth required)
- Path: `reviewId: number`
- Request: `{ content: string, parentReplyId?: number }`
- Response: `{ id: number, content: string }`

### 댓글 삭제

- **DELETE** `/api/v1/reviews/{reviewId}/replies/{replyId}` (Auth required)
- Path: `reviewId: number, replyId: number`

### 최상위 댓글 목록 조회

- **GET** `/api/v1/reviews/{reviewId}/replies`
- Path: `reviewId: number`
- Query: `cursor?`, `size?`
- Response:

```typescript
{
  id: number;
  content: string;
  userInfo: {
    userId: number;
    nickName: string;
    imageUrl: string;
  }
  createAt: string;
  likeCount: number;
  childReplyCount: number;
}
[];
```

### 하위 댓글 목록 조회

- **GET** `/api/v1/reviews/{reviewId}/replies/{replyId}/child-replies`
- Path: `reviewId: number, replyId: number`
- Query: `cursor?`, `size?`
