# Support & Common API

Source: https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html

## 배너

### 배너 목록 조회

- **GET** `/api/v1/banners`
- Response: `{ bannerId, title, imageUrl, linkUrl, displayOrder, isActive }[]`

## 문의 (Help)

### 문의글 작성

- **POST** `/api/v1/helps` (Auth required)
- Request: `{ title: string, content: string, type?: string }`

### 문의글 목록 조회

- **GET** `/api/v1/helps` (Auth required)
- Query: `cursor?`, `pageSize?`

### 문의글 상세 조회

- **GET** `/api/v1/helps/{helpId}` (Auth required)
- Path: `helpId: number`

### 문의글 수정

- **PATCH** `/api/v1/helps/{helpId}` (Auth required)
- Path: `helpId: number`

### 문의글 삭제

- **DELETE** `/api/v1/helps/{helpId}` (Auth required)
- Path: `helpId: number`

## 비즈니스 문의

### 비즈니스 문의 등록

- **POST** `/api/v1/business-inquiries` (Auth required)
- Request: `{ title, content, contactEmail?, contactPhone? }`

### 비즈니스 문의 목록 조회

- **GET** `/api/v1/business-inquiries` (Auth required)

### 비즈니스 문의 상세 조회

- **GET** `/api/v1/business-inquiries/{inquiryId}` (Auth required)

### 비즈니스 문의 수정

- **PATCH** `/api/v1/business-inquiries/{inquiryId}` (Auth required)

### 비즈니스 문의 삭제

- **DELETE** `/api/v1/business-inquiries/{inquiryId}` (Auth required)

## S3 Presign URL

### 이미지 업로드 URL 요청

- **GET** `/api/v1/s3/presign-url` (Auth required)
- Query: `type: string` (이미지 용도 구분)
- Response: `{ presignUrl: string, viewUrl: string }`

## 유저 히스토리

### 유저 히스토리 목록 조회

- **GET** `/api/v1/user-histories` (Auth required)
- Query: `cursor?`, `pageSize?`
