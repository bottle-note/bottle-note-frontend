$ARGUMENTS 이름으로 Zustand 스토어를 생성해주세요.

파일 위치: `src/store/`

이 프로젝트의 스토어 패턴:
```tsx
import { create } from 'zustand';

interface XxxState {
  value: string;
  isOpen: boolean;
}

interface XxxStore {
  state: XxxState;
  handleState: (newState: Partial<XxxState>) => void;
  handleReset: () => void;
}

const initialState: XxxState = {
  value: '',
  isOpen: false,
};

const useXxxStore = create<XxxStore>((set) => ({
  state: initialState,
  handleState: (newState) =>
    set((prev) => ({
      state: { ...prev.state, ...newState },
    })),
  handleReset: () => set({ state: initialState }),
}));

export default useXxxStore;
```

규칙:
- `use...Store` 네이밍 사용
- State와 Store 인터페이스 분리
- initialState 별도 정의
- handleReset 함수 포함
- default export 사용

사용 예시:
- `/store filter` - filterStore 생성
- `/store cart` - cartStore 생성 (장바구니)
- `/store notification` - notificationStore 생성
