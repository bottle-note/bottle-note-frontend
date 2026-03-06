# Auth & User API

Source: https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html

## Auth v2

### Apple Nonce 발급

- **GET** `/api/v2/auth/apple/nonce`
- Response: `{ nonce: string }`

### Apple 로그인

- **POST** `/api/v2/auth/apple`
- Request: `{ idToken: string, nonce: string }`
- Response: `{ accessToken, refreshToken, userId, nickName, imageUrl, isNewUser }`

### 카카오 로그인

- **POST** `/api/v2/auth/kakao`
- Request: `{ accessToken: string }`
- Response: `{ accessToken, refreshToken, userId, nickName, imageUrl, isNewUser }`

### 관리자 권한 확인

- **GET** `/api/v2/auth/admin/permissions` (Auth required)
- Response: `{ isRootAdmin: boolean }`

## OAuth v1

### 소셜 로그인

- **POST** `/api/v1/oauth/login`
- Request: `{ socialId: string, socialType: "KAKAO" | "GOOGLE" | "APPLE" | "NAVER" }`
- Response: `{ accessToken, refreshToken, userId, nickName, imageUrl }`

### 기본 회원가입

- **POST** `/api/v1/oauth/basic/signup`
- Request: `{ email: string, password: string, nickName: string }`
- Response: `{ userId, email, nickName }`

### 기본 로그인

- **POST** `/api/v1/oauth/basic/login`
- Request: `{ email: string, password: string }`
- Response: `{ accessToken, refreshToken, userId, nickName, imageUrl }`

### 토큰 재발급

- **POST** `/api/v1/oauth/reissue`
- Request: `{ refreshToken: string }`
- Response: `{ accessToken, refreshToken }`

### 계정 복구 (탈퇴 후)

- **POST** `/api/v1/oauth/restore`
- Request: `{ socialId: string, socialType: string }`
- Response: `{ accessToken, refreshToken, userId }`

## User

### 닉네임 변경

- **PATCH** `/api/v1/users/nickname` (Auth required)
- Request: `{ nickName: string }` (2-11자, 한글/영문/숫자만)
- Response: `{ message: string }`

### 프로필 이미지 변경

- **PATCH** `/api/v1/users/profile-image` (Auth required)
- Request: `{ imageUrl: string }`
- Response: `{ message: string }`

### 현재 사용자 정보 조회

- **GET** `/api/v1/users/current` (Auth required)
- Response: `{ userId, nickName, imageUrl, email, socialType, gender, age, role }`

### 회원 탈퇴

- **DELETE** `/api/v1/users` (Auth required)
- Response: `{ message: string }`

## Push Token

### 디바이스 토큰 등록

- **POST** `/api/v1/push/token` (Auth required)
- Request: `{ deviceToken: string, deviceType: "IOS" | "ANDROID" }`
- Response: `{ message: string }`
