$ARGUMENTS 이름으로 커스텀 훅을 생성해주세요.

파일 위치: `src/hooks/`

이 프로젝트의 훅 패턴:

```tsx
import { useState, useCallback, useRef } from 'react';

interface Options {
  // 옵션 타입 정의 (필요시)
}

export const useXxx = (options?: Options) => {
  const [state, setState] = useState<Type>(initialValue);
  const ref = useRef<NodeJS.Timeout | null>(null);

  const action = useCallback((params: ParamType) => {
    // 로직 구현
  }, []);

  return { state, action };
};
```

규칙:

- `use` 접두사 사용
- named export 사용 (`export const useXxx`)
- useCallback으로 함수 메모이제이션
- 타입 명시적 정의
- cleanup 로직 포함 (필요시)

사용 예시:

- `/hook useBookmark` - 북마크 관련 훅 생성
- `/hook useDebounce` - 디바운스 훅 생성
- `/hook useLocalStorage` - 로컬스토리지 훅 생성
