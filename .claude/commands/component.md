새로운 React 컴포넌트를 생성해주세요.

이 프로젝트의 컴포넌트 규칙:
- 함수형 컴포넌트 사용
- TypeScript로 props 타입 정의
- Tailwind CSS로 스타일링
- named export 사용

컴포넌트 구조 예시:
```tsx
interface Props {
  // props 정의
}

export function ComponentName({ ...props }: Props) {
  return (
    // JSX
  );
}
```

생성 위치:
- 재사용 컴포넌트: `src/components/`
- 페이지 전용 컴포넌트: 해당 페이지의 `_components/` 폴더
