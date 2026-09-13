![Group 236 (3)](https://github.com/bottle-note/.github/assets/97773895/bd41fdbb-f8c6-496d-87df-536b0b85ab89)

**Tech Stack**

- Next.js 14
- React 18
- TanStack Query v5
- Zustand v4

<img src="https://github.com/bottle-note/.github/assets/97773895/fa515094-a490-4b7b-9bca-026752fe3de1" alt="Image 1" width="49.5%"/>
<img src="https://github.com/bottle-note/.github/assets/97773895/98a69d6d-af4f-4365-ac6c-b3e7bdd6aed1" alt="Image 4" width="49.5%"/>
<img src="https://github.com/bottle-note/.github/assets/97773895/5877ab4b-af23-4767-aebc-5e97a35a89ba" alt="Image 3" width="49.5%"/>
<img src="https://github.com/bottle-note/.github/assets/97773895/039cf3df-7169-46ed-a76b-72de6f1a1217" alt="Image 2" width="49.5%"/>
<br/>

## _bottle note_

**📄 \*내 입맛에 딱 맞는 한병을 찾아가는 여정노트**

보틀노트는 위스키 애호가들이 모여 서로의 의견을 공유하고, 더욱 즐겁고 유익한 시음 경험을 할 수 있도록 도와줍니다. <br/>
위스키에 대한 열정을 함께 나눠보세요! 쉽고 편리하게 위스키 평가와 리뷰를 공유할 수 있어요!

---

**🥃 위스키 별점 및 리뷰 작성**

위스키를 시음한 후 별점을 부여하고, 상세한 리뷰를 작성해 보세요! <br/>
맛, 향, 느낌 등 다양한 측면을 기록하고 공유할 수 있습니다. <br/>
가격을 입력하고, 시음한 장소를 태그하여 좋은 경험한 장소를 기록해 보는건 어때요?<br/>
<br/>

**🥃 위스키 정보 및 리뷰 보기**

위스키의 상세 정보와 다른 사용자의 리뷰를 쉽게 확인할 수 있습니다. <br/>
다양한 의견을 통해 다른 사람들이 위스키를 어떻게 평가했는지 알 수 있고 <br/>
새로운 위스키를 시도해볼 수 있어요!<br/>
<br/>

**🥃 찜하기 기능으로 위스키 목록 관리**

관심 있는 위스키를 찜하기 기능을 통해 목록에 추가하고 <br/>
찜한 위스키 목록을 통해 나만의 위스키 컬렉션을 만들 수 있어요!<br/>
<br/>
**🥃 다른 유저와 팔로우 및 별점 보기**

다른 사용자를 팔로우하여 그들의 별점과 리뷰를 볼 수 있어요! <br/>
나의 팔로워들은 어떤 평가를 했을까요? <br/>
팔로워가 나와 취향이 비슷하다면, 내 입맛에 맞는 새로운 위스키를 알 수 있을지도?<br/>
<br/>

**🥃 나의 평가 및 별점 기록 관리**

내가 평가한 위스키와 부여한 별점을 한눈에 볼 수 있어요! <br/>
나만의 위스키 평가 기록을 통해 나의 취향을 분석하고 다음 시음을 계획해보세요!<br/>
<br/>

---

보틀노트는 위스키 애호가들이 모여 서로의 의견을 공유하고 <br/>
더욱 즐겁고 유익한 시음 경험을 할 수 있도록 도와줍니다.

![boton](https://github.com/user-attachments/assets/d8750770-1e6a-4133-86a4-298f795420a6)

---

## 🤖 AI 개발 도구 가이드

프로젝트 공통 에이전트 지침은 `AGENTS.md`에서 관리합니다.

## API 연결 환경

로컬 개발은 `pnpm dev:local`로 실행합니다. 서버의 API 호출과 Next.js rewrite는
`INTERNAL_SERVER_URL` 하나를 공통으로 사용합니다.

| 환경파일                        | `INTERNAL_SERVER_URL` 정리 후 값          |
| ------------------------------- | ----------------------------------------- |
| `local.sops.env`                | `https://api.development.bottle-note.com` |
| `dev.sops.env`, `prod.sops.env` | `http://product-api`                      |

`src/api/_shared/serverApiUrl.mjs`에서 서버 origin에 `/api/v1` 또는 `/api/v2`를 붙입니다.
호출하는 서비스가 버전을 지정하며, 인증은 v2, 나머지 현재 서버 조회는 v1을 사용합니다.
기존 환경값의 `/api/v1`은 무시하므로 환경파일을 나중에 정리해도 동작합니다.
`INTERNAL_SERVER_URL`이 없으면 개발 서버 시작·빌드를 실패시키며 공개 URL로 대체하지 않습니다.
브라우저는 기존 `/bottle-api/v1/*`, `/bottle-api/v2/*` 경로를 사용합니다.
버전 없는 `/bottle-api/*` 레거시 rewrite는 지원하지 않습니다.
`NEXT_PUBLIC_SERVER_URL`은 MBTI의 개발·운영 데이터 구분에 사용하며, 서버 API 호출 대상으로 사용하지 않습니다.

Docker 빌드는 선택한 환경파일을 `.env`로 복호화한 뒤 `next build`를 실행하고,
같은 `.env`를 실행 이미지에 포함합니다. rewrite 대상은 빌드 결과에 저장되므로
대상 URL을 바꿀 때는 이미지를 다시 빌드해야 합니다.

### 환경파일 정리 항목

이 코드가 반영된 뒤 `application.next-js`의 local/dev/prod 파일에서 정리합니다.
환경파일 자체는 이번 변경에서 수정하지 않습니다.

| 변수                        | 정리                                                    |
| --------------------------- | ------------------------------------------------------- |
| `INTERNAL_SERVER_URL`       | 유지. 위 표처럼 `/api/v1`을 제거한 origin으로 정리 가능 |
| `INTERNAL_SERVER_URL_V2`    | 삭제 가능. v2 경로는 코드에서 생성                      |
| `SERVER_URL_V2`             | 삭제 가능. 서버 인증도 공통 주소 사용                   |
| `NEXT_PUBLIC_SERVER_URL_V2` | 삭제 가능. 브라우저는 상대 경로 사용                    |
| `NEXT_PUBLIC_SERVER_URL`    | 유지. MBTI의 개발·운영 데이터 구분에 아직 사용          |
