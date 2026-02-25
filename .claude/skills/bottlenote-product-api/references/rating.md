# Rating API

Source: https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html

## 별점

### 별점 목록 조회

- **GET** `/api/v1/ratings/{alcoholId}`
- Path: `alcoholId: number`
- Query: `cursor?`, `size?`
- Response:

```typescript
{
  totalCount: number;
  ratings: {
    userId: number;
    rating: number;
    userNickname: string;
    createAt: string;
  }
  [];
}
```

### 내 별점 조회

- **GET** `/api/v1/ratings/{alcoholId}/user` (Auth required)
- Path: `alcoholId: number`
- Response:

```typescript
{
  ratingPoint: number | null;
  averageRatingPoint: number;
  averageRatingCount: number;
}
```

### 별점 등록/수정

- **POST** `/api/v1/ratings` (Auth required)
- Request: `{ alcoholId: number, ratingPoint: number }`
- Response: `{ message: string, ratingPoint: number }`
