---
name: bottlenote-product-api
description: >
  Bottle Note Product(사용자향) API 명세를 조회하는 레퍼런스 스킬.
  API 문서(https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html)
  기반으로 엔드포인트 스펙(method, path, request/response 스키마)을 제공한다.
  트리거: (1) "product API", "프로덕트 API", "사용자 API" 등 명시적 요청
  (2) 프론트엔드 API 구현 전 스펙 확인이 필요할 때
  (3) "리뷰 API", "위스키 API", "마이페이지 API" 등 도메인별 요청
  (4) "bottlenote-product-api" 언급 시
---

# Bottle Note Product API Reference

Product(사용자향) API 명세를 도메인별로 조회한다.

## Usage

사용자가 특정 도메인의 API 스펙을 요청하면 해당 references 파일을 읽어 제공한다.

| 키워드                                                           | Reference 파일                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------ |
| 인증, 로그인, OAuth, 토큰, 회원가입, 닉네임, 프로필이미지, 탈퇴  | [references/auth-user.md](references/auth-user.md)           |
| 위스키, 술, 검색, 찜, 카테고리, 지역, 큐레이션, 인기, 탐색, 태그 | [references/alcohol.md](references/alcohol.md)               |
| 리뷰, 댓글, 좋아요                                               | [references/review.md](references/review.md)                 |
| 별점, 평점, rating                                               | [references/rating.md](references/rating.md)                 |
| 마이페이지, 프로필, 마이보틀                                     | [references/mypage.md](references/mypage.md)                 |
| 팔로우, 차단, 신고                                               | [references/social.md](references/social.md)                 |
| 문의, 도움말, 비즈니스, 배너, S3, 푸시, 히스토리                 | [references/support-common.md](references/support-common.md) |
| 전체                                                             | 모든 references 파일을 순서대로 읽는다                       |

## 스펙 최신 여부 확인

references 파일은 스냅샷이다. 최신 여부가 불확실하면:

```
WebFetch https://bottle-note.github.io/bottle-note-api-server/bottle-note/product-api/product-api.html
```

## Common Response Wrapper

```json
{ "success": boolean, "code": number, "data": T, "errors": object, "meta": {} }
```

커서 기반 페이지네이션 (meta 내부):

```json
{ "pageable": { "currentCursor": number, "cursor": number, "pageSize": number, "hasNext": boolean } }
```

인증 필요 엔드포인트: `Authorization: Bearer <accessToken>` 헤더 필수.
