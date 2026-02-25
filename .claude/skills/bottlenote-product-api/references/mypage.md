# MyPage API

Source: https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html

## 마이페이지 기본정보

### 마이페이지 조회

- **GET** `/api/v1/my-page/{userId}`
- Path: `userId: number`
- Response:

```typescript
{
  userId: number;
  nickName: string;
  imageUrl: string | null;
  reviewCount: number;
  ratingCount: number;
  pickCount: number;
  followerCount: number;
  followingCount: number;
  isFollow: boolean;
  isMyPage: boolean;
}
```

## 마이보틀

공통 Query: `keyword?`, `regionId?`, `sortType?` (LATEST default), `sortOrder?`, `cursor?`, `pageSize?`

공통 응답 구조:

```typescript
{
  userId: number;
  isMyPage: boolean;
  totalCount: number;
  myBottleList: {
    baseMyBottleInfo: {
      alcoholId: number;
      korName: string;
      engName: string;
      korCategoryName: string;
      engCategoryName: string;
      imageUrl: string | null;
      isHot5: boolean;
    }
    // + 탭별 추가 필드 (아래 참조)
  }
  [];
}
```

### 리뷰 마이보틀

- **GET** `/api/v1/mypage/{userId}/my-bottle/reviews`
- 추가 필드: `reviewId`, `content`, `tastingTagList`, `isBestReview`

### 별점 마이보틀

- **GET** `/api/v1/mypage/{userId}/my-bottle/ratings`
- 추가 필드: `myRatingPoint`, `averageRatingPoint`, `averageRatingCount`, `ratingModifyAt`

### 찜 마이보틀

- **GET** `/api/v1/mypage/{userId}/my-bottle/picks`
- 추가 필드: `isPicked`, `totalPicksCount`
