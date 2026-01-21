$ARGUMENTS 에 대한 테스트 코드를 작성해주세요.

(인자가 없으면 현재 파일에 대한 테스트를 작성합니다)

이 프로젝트는 다음 테스트 도구를 사용합니다:

- Jest
- React Testing Library
- @testing-library/jest-dom

테스트 파일 규칙:

- 파일명: `*.test.tsx` 또는 `*.test.ts`
- 위치: 테스트 대상 파일과 같은 디렉토리

다음을 포함해주세요:

1. 기본 렌더링 테스트
2. 주요 기능 동작 테스트
3. 엣지 케이스 테스트
4. 에러 상태 테스트 (해당되는 경우)

테스트 실행: `pnpm test`

사용 예시:

- `/test` - 현재 파일 테스트 작성
- `/test useToast` - useToast 훅 테스트 작성
- `/test src/components/Button.tsx` - 특정 컴포넌트 테스트 작성
