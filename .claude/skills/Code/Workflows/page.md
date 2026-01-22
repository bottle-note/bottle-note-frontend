$ARGUMENTS 경로에 Next.js App Router 페이지를 생성해주세요.

파일 위치: `src/app/`

이 프로젝트의 페이지 패턴:

### 기본 페이지 구조

```tsx
// src/app/(primary)/xxx/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '페이지 제목 | Bottle Note',
  description: '페이지 설명',
};

export default function XxxPage() {
  return (
    <main className="container mx-auto px-4 py-6">{/* 페이지 컨텐츠 */}</main>
  );
}
```

### 동적 라우트

```tsx
// src/app/(primary)/xxx/[id]/page.tsx
interface Props {
  params: { id: string };
}

export default function XxxDetailPage({ params }: Props) {
  const { id } = params;
  // ...
}
```

### 레이아웃 그룹

- `(primary)` - 메인 레이아웃 (헤더, 푸터 포함)
- `(custom)` - 커스텀 레이아웃 (로그인, OAuth 등)

### 페이지 전용 컴포넌트

- 해당 페이지 폴더 내 `_components/` 디렉토리에 생성

사용 예시:

- `/page settings/profile` - 프로필 설정 페이지 생성
- `/page whiskey/[id]` - 위스키 상세 페이지 생성
- `/page search` - 검색 페이지 생성
