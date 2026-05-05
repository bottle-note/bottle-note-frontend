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

### WebFetch 사용 시 필수 규칙 (할루시네이션 방지)

WebFetch는 내부적으로 별도 모델이 페이지를 요약하므로, 추론·일반화·다른 엔드포인트 패턴 적용으로 **문서에 없는 정보를 만들어낼 수 있다**. 다음을 반드시 지킬 것:

1. **WebFetch 프롬프트에 항상 다음 문구를 포함한다**:

   - "문서에 명시된 원문만 추출하고, 추론/추측/일반화는 금지한다."
   - "명시되지 않은 항목은 '명시 없음'이라고 답하라. 다른 엔드포인트 패턴이나 응답 필드(myRating, isPicked 등)로부터 인증 필요 여부를 추론하지 말 것."
   - "각 항목은 문서 원문을 그대로 인용하거나, 없으면 '명시 없음'으로만 답한다."

2. **인증 필요 여부**는 특히 환각이 잦은 항목이다. 다음 셋 중 하나로만 단정한다:

   - 해당 엔드포인트 섹션에 `Authorization`/`Bearer`/"인증 필요" 명시 → "필요"
   - 명시 없음 → "문서에 명시 없음 (백엔드 확인 필요)"
   - 절대 응답 필드(myRating, isPicked 등)나 도메인 직관으로 추론하지 말 것

3. **WebFetch 응답을 사용자에게 그대로 전달하지 말 것**. 받은 내용 중 "Required", "Authentication", "필수" 같은 단정 표현이 있으면 원문 인용이 함께 있는지 검증한다. 인용 없으면 "명시 없음"으로 보고 다시 질의한다.

4. references 파일에 없는 신규 정보(예: 신규 파라미터, 응답 필드 추가)는 WebFetch 결과만으로 결론짓지 말고, 가능하면 GitHub PR/이슈로 교차 확인한다.

## Common Response Wrapper

```json
{ "success": boolean, "code": number, "data": T, "errors": object, "meta": {} }
```

커서 기반 페이지네이션 (meta 내부):

```json
{ "pageable": { "currentCursor": number, "cursor": number, "pageSize": number, "hasNext": boolean } }
```

인증 필요 엔드포인트: `Authorization: Bearer <accessToken>` 헤더 필수.
