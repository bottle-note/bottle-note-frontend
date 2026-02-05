# 공유 모듈 리팩토링 Work Plan

> 생성일: 2026-02-05
> 목표: 리뷰/위스키/이벤트 공유 통합 설계, 웹 우선 + 앱 대응

---

## 요구사항 요약

| 항목          | 내용                                   |
| ------------- | -------------------------------------- |
| **공유 타입** | 리뷰, 위스키, 이벤트(타로카드)         |
| **공유 채널** | 카카오톡 + 링크복사 (확장 가능하게)    |
| **OG 이미지** | 리뷰는 동적 생성, 위스키는 기존 이미지 |
| **앱 대응**   | WebView JS 브릿지 → 네이티브 공유 시트 |
| **폴백**      | 네이티브 실패 시 웹 바텀시트           |
| **Analytics** | 공유 채널 + 콘텐츠 + 클릭 추적         |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    ShareBottomSheet (공통 UI)               │
│  - 카카오톡 버튼, 링크복사 버튼                              │
│  - 확장 가능한 버튼 슬롯                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    useShare (통합 훅)                        │
│  - shareConfig 기반 동작                                     │
│  - 플랫폼 감지 (웹/앱/네이티브)                              │
│  - Analytics 이벤트 발생                                     │
└─────────────────────────────────────────────────────────────┘
          │                   │                    │
          ▼                   ▼                    ▼
   ┌──────────┐        ┌──────────┐         ┌──────────┐
   │useKakao  │        │useLink   │         │useNative │
   │Share     │        │Share     │         │Share     │
   └──────────┘        └──────────┘         └──────────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    ▼                             ▼
                             navigator.share              JS Bridge (앱)
                             (웹 폴백)                    → Native Sheet
```

---

## 파일 구조

```
src/
├── components/share/
│   ├── ShareBottomSheet.tsx      # 공통 바텀시트 UI
│   ├── ShareButton.tsx           # 공유 트리거 버튼
│   └── icons/                    # 카카오, 링크 아이콘
├── hooks/share/
│   ├── useShare.ts               # 통합 훅 (NEW)
│   ├── useKakaoShare.ts          # 기존
│   ├── useLinkShare.ts           # 기존
│   └── useNativeShare.ts         # 네이티브 브릿지 (NEW)
├── lib/
│   ├── kakao/                    # 기존
│   └── native/
│       └── bridge.ts             # 앱 브릿지 (NEW)
├── types/
│   └── share.ts                  # ShareConfig 등 (NEW)
└── utils/
    └── share/
        ├── createShareConfig.ts  # 도메인별 config 생성 (NEW)
        └── shareAnalytics.ts     # 추적 유틸 (NEW)
```

---

## Phase 1: 공통 Share 모듈 구축 (웹 우선)

### Task 1.1: ShareConfig 타입 정의

- [ ] `src/types/share.ts` 생성
- [ ] ShareConfig, ShareResult, ShareChannel 타입 정의

```typescript
// src/types/share.ts
export type ShareContentType = 'review' | 'whisky' | 'event';
export type ShareChannel = 'kakao' | 'link' | 'native';
export type SharePlatform = 'web' | 'app-ios' | 'app-android';

export interface ShareConfig {
  type: ShareContentType;
  contentId: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonTitle?: string;
}

export interface ShareResult {
  success: boolean;
  channel: ShareChannel;
  error?: string;
}
```

### Task 1.2: 공용 ShareBottomSheet 리팩토링

- [ ] `src/components/share/ShareBottomSheet.tsx` 생성
- [ ] Props로 ShareConfig 받도록 변경
- [ ] 기존 타로카드 UI 재사용
- [ ] KakaoIcon, LinkIcon 별도 파일로 분리

### Task 1.3: useShare 통합 훅 구현

- [ ] `src/hooks/share/useShare.ts` 생성
- [ ] 플랫폼 감지 로직
- [ ] 카카오/링크/네이티브 분기 처리
- [ ] Analytics 이벤트 호출 연동

---

## Phase 2: 각 도메인별 적용

### Task 2.1: 리뷰 공유 적용

- [ ] `ReviewInteractionBar`에 ShareBottomSheet 연결
- [ ] 리뷰 데이터로 ShareConfig 생성하는 헬퍼 함수
- [ ] 공유 버튼 클릭 시 바텀시트 열기

### Task 2.2: 리뷰 OG 이미지 동적 생성

- [ ] `/review/[id]/opengraph-image.tsx` 생성
- [ ] 리뷰 제목, 작성자, 별점 등 포함
- [ ] Bottle Note 브랜딩 적용

### Task 2.3: 위스키 공유 적용

- [ ] 위스키 상세 페이지에 공유 버튼 추가
- [ ] 기존 위스키 썸네일을 OG 이미지로 활용
- [ ] ShareConfig 생성 헬퍼 함수

### Task 2.4: 타로카드 마이그레이션

- [ ] 기존 ShareBottomSheet를 공용 컴포넌트로 교체
- [ ] ShareConfig 패턴으로 통일

---

## Phase 3: 앱 네이티브 대응

### Task 3.1: JS Bridge 인터페이스 정의

- [ ] `src/lib/native/bridge.ts` 생성
- [ ] NativeShareBridge 인터페이스 정의
- [ ] 앱 팀과 프로토콜 협의

```typescript
// src/lib/native/bridge.ts
interface NativeShareBridge {
  share(config: ShareConfig): Promise<ShareResult>;
  isAvailable(): boolean;
}

declare global {
  interface Window {
    BottleNote?: {
      share: NativeShareBridge;
    };
  }
}
```

### Task 3.2: useNativeShare 훅 구현

- [ ] `src/hooks/share/useNativeShare.ts` 생성
- [ ] WebView 환경 감지
- [ ] 브릿지 호출 → 네이티브 시트
- [ ] 실패 시 폴백 처리

### Task 3.3: 앱 팀 협업

- [ ] 브릿지 프로토콜 문서화
- [ ] iOS 구현 요청
- [ ] Android 구현 요청

---

## Phase 4: Analytics 연동

### Task 4.1: Share Analytics 유틸 구현

- [ ] `src/utils/share/shareAnalytics.ts` 생성
- [ ] trackShare 함수 구현

```typescript
// 공유 버튼 클릭 시
trackShare({
  contentType: 'review' | 'whisky' | 'event',
  contentId: string,
  channel: 'kakao' | 'link' | 'native',
  platform: 'web' | 'app-ios' | 'app-android',
});
```

### Task 4.2: UTM 파라미터 적용

- [ ] 공유 URL에 UTM 파라미터 자동 추가
- [ ] `?utm_source=share&utm_medium={channel}&utm_content={contentType}_{contentId}`

### Task 4.3: Analytics 대시보드 연동

- [ ] 기존 Analytics 시스템에 이벤트 연결
- [ ] 공유 성과 추적 가능하도록

---

## 구현 순서 (우선순위)

| 순서 | 작업                              | 예상 규모 | Phase |
| ---- | --------------------------------- | --------- | ----- |
| 1    | ShareConfig 타입 정의             | S         | 1     |
| 2    | 공용 ShareBottomSheet 리팩토링    | M         | 1     |
| 3    | useShare 통합 훅                  | M         | 1     |
| 4    | 리뷰 공유 적용                    | M         | 2     |
| 5    | 리뷰 OG 이미지 동적 생성          | M         | 2     |
| 6    | 위스키 공유 적용                  | S         | 2     |
| 7    | 타로카드 마이그레이션             | S         | 2     |
| 8    | Analytics 연동                    | M         | 4     |
| 9    | useNativeShare + 브릿지 (앱 대응) | L         | 3     |

---

## 주의사항

1. **카카오 SDK 테스트 필요**: 브라우저에서 정상 동작 확인
2. **기존 타로카드 기능 유지**: 마이그레이션 시 회귀 방지
3. **앱 팀 협업 필수**: 브릿지 프로토콜은 사전 협의 필요
4. **점진적 적용**: 리뷰 → 위스키 → 타로카드 순서로 안전하게
