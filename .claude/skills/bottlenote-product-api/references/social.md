# Social API (Follow, Block, Report)

Source: https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html

## 팔로우

### 팔로우/언팔로우

- **POST** `/api/v1/follows` (Auth required)
- Request: `{ userId: number }`
- Response: `{ message: string, followStatus: "FOLLOW" | "UNFOLLOW" }`

### 팔로워 목록 조회

- **GET** `/api/v1/followers/{userId}`
- Path: `userId: number`
- Response: `{ userId, nickName, imageUrl, isFollow }[]`

### 팔로잉 목록 조회

- **GET** `/api/v1/followings/{userId}`
- Path: `userId: number`
- Response: `{ userId, nickName, imageUrl, isFollow }[]`

## 차단

### 사용자 차단

- **POST** `/api/v1/blocks` (Auth required)
- Request: `{ userId: number }`

### 차단 해제

- **DELETE** `/api/v1/blocks/{userId}` (Auth required)
- Path: `userId: number`

### 차단 목록 조회

- **GET** `/api/v1/blocks` (Auth required)
- Response: `{ userId, nickName, imageUrl }[]`

### 차단 사용자 ID 목록

- **GET** `/api/v1/blocks/ids` (Auth required)
- Response: `number[]`

### 차단 여부 확인

- **GET** `/api/v1/blocks/{userId}` (Auth required)
- Path: `userId: number`
- Response: `{ isBlocked: boolean }`

### 상호 차단 여부 확인

- **GET** `/api/v1/blocks/mutual/{userId}` (Auth required)
- Path: `userId: number`
- Response: `{ isMutualBlocked: boolean }`

### 나를 차단한 사용자 수

- **GET** `/api/v1/blocks/count/to-me` (Auth required)
- Response: `{ count: number }`

### 내가 차단한 사용자 수

- **GET** `/api/v1/blocks/count/by-me` (Auth required)
- Response: `{ count: number }`

## 신고

### 사용자 신고

- **POST** `/api/v1/reports/user` (Auth required)
- Request: `{ userId: number, reportType: string, content?: string }`
