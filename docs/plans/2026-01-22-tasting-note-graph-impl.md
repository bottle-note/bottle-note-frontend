# 테이스팅 노트 그래프 구현 계획

**Goal:** 레이더 차트로 위스키 풍미를 시각화하고 이미지로 저장하는 기능 구현

**Architecture:** 위스키 상세 페이지에서 진입 → 테이스팅 노트 페이지에서 슬라이더로 5개 축 조절 → 레이더 차트 실시간 반영 → html2canvas로 이미지 저장

**Tech Stack:** Recharts (레이더 차트), html2canvas (이미지 캡처), useState (상태 관리)

---

## Task 1: 패키지 설치

**Step 1: recharts, html2canvas 설치**

Run: `pnpm add recharts html2canvas`

**Step 2: 타입 설치**

Run: `pnpm add -D @types/html2canvas`

**Step 3: 설치 확인**

Run: `pnpm list recharts html2canvas`
Expected: 두 패키지 버전 표시

---

## Task 2: 타입 정의

**Files:**

- Create: `src/app/(primary)/tasting-note/[alcoholId]/types.ts`

**Step 1: 테이스팅 노트 타입 작성**

```typescript
export interface TastingNoteData {
  body: number;
  peaty: number;
  sweet: number;
  fruity: number;
  spicy: number;
}

export interface TastingNoteFormState extends TastingNoteData {
  memo: string;
}

export const TASTING_AXES = [
  { key: 'body', label: '바디', labelEng: 'Body' },
  { key: 'peaty', label: '피티', labelEng: 'Peaty' },
  { key: 'sweet', label: '스위트', labelEng: 'Sweet' },
  { key: 'fruity', label: '프루티', labelEng: 'Fruity' },
  { key: 'spicy', label: '스파이시', labelEng: 'Spicy' },
] as const;

export type TastingAxisKey = (typeof TASTING_AXES)[number]['key'];

export const DEFAULT_TASTING_NOTE: TastingNoteFormState = {
  body: 5,
  peaty: 5,
  sweet: 5,
  fruity: 5,
  spicy: 5,
  memo: '',
};
```

---

## Task 3: TastingRadarChart 컴포넌트

**Files:**

- Create: `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingRadarChart.tsx`

**Step 1: 레이더 차트 컴포넌트 작성**

```typescript
'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

import { TastingNoteData, TASTING_AXES } from '../types';

interface Props {
  data: TastingNoteData;
}

export default function TastingRadarChart({ data }: Props) {
  const chartData = TASTING_AXES.map((axis) => ({
    axis: axis.label,
    value: data[axis.key],
    fullMark: 10,
  }));

  return (
    <div className="w-full aspect-square max-w-[300px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e5e5e5" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#525252', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: '#a3a3a3', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="테이스팅"
            dataKey="value"
            stroke="#FF6B35"
            fill="#FF6B35"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## Task 4: TastingSlider 컴포넌트

**Files:**

- Create: `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingSlider.tsx`

**Step 1: 슬라이더 컴포넌트 작성**

```typescript
'use client';

interface Props {
  label: string;
  labelEng: string;
  value: number;
  onChange: (value: number) => void;
}

export default function TastingSlider({
  label,
  labelEng,
  value,
  onChange,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 shrink-0">
        <p className="text-14 font-medium text-mainDarkGray">{label}</p>
        <p className="text-10 text-subCoral">{labelEng}</p>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-subCoral"
      />
      <span className="w-8 text-right text-14 font-bold text-subCoral">
        {value}
      </span>
    </div>
  );
}
```

---

## Task 5: TastingSliderGroup 컴포넌트

**Files:**

- Create: `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingSliderGroup.tsx`

**Step 1: 슬라이더 그룹 컴포넌트 작성**

```typescript
'use client';

import { TastingNoteData, TASTING_AXES, TastingAxisKey } from '../types';
import TastingSlider from './TastingSlider';

interface Props {
  data: TastingNoteData;
  onChange: (key: TastingAxisKey, value: number) => void;
}

export default function TastingSliderGroup({ data, onChange }: Props) {
  return (
    <div className="space-y-4 px-5">
      {TASTING_AXES.map((axis) => (
        <TastingSlider
          key={axis.key}
          label={axis.label}
          labelEng={axis.labelEng}
          value={data[axis.key]}
          onChange={(value) => onChange(axis.key, value)}
        />
      ))}
    </div>
  );
}
```

---

## Task 6: TastingNoteCapture 컴포넌트

**Files:**

- Create: `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingNoteCapture.tsx`

**Step 1: 캡처 영역 컴포넌트 작성**

```typescript
'use client';

import { forwardRef } from 'react';
import Image from 'next/image';

import { TastingNoteData, TASTING_AXES } from '../types';
import TastingRadarChart from './TastingRadarChart';

interface Props {
  alcoholName: string;
  alcoholImage: string;
  data: TastingNoteData;
  memo: string;
  date: string;
}

const TastingNoteCapture = forwardRef<HTMLDivElement, Props>(
  ({ alcoholName, alcoholImage, data, memo, date }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white p-5 rounded-xl"
        style={{ width: '360px' }}
      >
        {/* 헤더: 위스키 정보 */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="relative w-12 h-16 rounded-md overflow-hidden bg-gray-100">
            {alcoholImage && (
              <Image
                src={alcoholImage}
                alt={alcoholName}
                fill
                className="object-contain"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-14 font-bold text-mainDarkGray truncate">
              {alcoholName}
            </p>
            <p className="text-11 text-subCoral">{date}</p>
          </div>
        </div>

        {/* 차트 */}
        <div className="mb-4">
          <TastingRadarChart data={data} />
        </div>

        {/* 점수 */}
        <div className="grid grid-cols-5 gap-2 mb-4 px-2">
          {TASTING_AXES.map((axis) => (
            <div key={axis.key} className="text-center">
              <p className="text-10 text-mainGray">{axis.label}</p>
              <p className="text-14 font-bold text-subCoral">{data[axis.key]}</p>
            </div>
          ))}
        </div>

        {/* 메모 */}
        {memo && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-12 text-mainDarkGray whitespace-pre-wrap">
              {memo}
            </p>
          </div>
        )}

        {/* 워터마크 */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <p className="text-10 text-mainGray">Bottle Note</p>
        </div>
      </div>
    );
  },
);

TastingNoteCapture.displayName = 'TastingNoteCapture';

export default TastingNoteCapture;
```

---

## Task 7: useTastingNoteCapture 훅

**Files:**

- Create: `src/app/(primary)/tasting-note/[alcoholId]/_hooks/useTastingNoteCapture.ts`

**Step 1: 이미지 캡처 훅 작성**

```typescript
'use client';

import { useRef, useCallback, useState } from 'react';
import html2canvas from 'html2canvas';

export const useTastingNoteCapture = () => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureAndDownload = useCallback(
    async (filename: string = 'tasting-note') => {
      if (!captureRef.current || isCapturing) return;

      setIsCapturing(true);

      try {
        const canvas = await html2canvas(captureRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Failed to capture tasting note:', error);
      } finally {
        setIsCapturing(false);
      }
    },
    [isCapturing],
  );

  return {
    captureRef,
    isCapturing,
    captureAndDownload,
  };
};
```

---

## Task 8: TastingNoteForm 컴포넌트

**Files:**

- Create: `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingNoteForm.tsx`

**Step 1: 폼 컨테이너 컴포넌트 작성**

```typescript
'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';

import {
  TastingNoteFormState,
  TastingAxisKey,
  DEFAULT_TASTING_NOTE,
} from '../types';
import TastingRadarChart from './TastingRadarChart';
import TastingSliderGroup from './TastingSliderGroup';
import TastingNoteCapture from './TastingNoteCapture';
import { useTastingNoteCapture } from '../_hooks/useTastingNoteCapture';

interface Props {
  alcoholId: string;
  alcoholName: string;
  alcoholImage: string;
}

export default function TastingNoteForm({
  alcoholId,
  alcoholName,
  alcoholImage,
}: Props) {
  const [formState, setFormState] =
    useState<TastingNoteFormState>(DEFAULT_TASTING_NOTE);
  const { captureRef, isCapturing, captureAndDownload } =
    useTastingNoteCapture();

  const handleSliderChange = useCallback(
    (key: TastingAxisKey, value: number) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleMemoChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, memo: e.target.value }));
    },
    [],
  );

  const handleSaveImage = () => {
    const safeName = alcoholName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const dateStr = format(new Date(), 'yyyyMMdd');
    captureAndDownload(`tasting-note_${safeName}_${dateStr}`);
  };

  const today = format(new Date(), 'yyyy.MM.dd');

  return (
    <div className="pb-32">
      {/* 미리보기 차트 */}
      <section className="py-6">
        <TastingRadarChart data={formState} />
      </section>

      {/* 슬라이더 */}
      <section className="py-6 border-t border-mainGray/30">
        <h3 className="px-5 mb-4 text-14 font-bold text-mainDarkGray">
          풍미 조절
        </h3>
        <TastingSliderGroup data={formState} onChange={handleSliderChange} />
      </section>

      {/* 메모 */}
      <section className="px-5 py-6 border-t border-mainGray/30">
        <h3 className="mb-4 text-14 font-bold text-mainDarkGray">메모</h3>
        <textarea
          value={formState.memo}
          onChange={handleMemoChange}
          placeholder="이 위스키에 대한 메모를 남겨보세요..."
          className="w-full h-24 p-3 text-14 border border-mainGray/30 rounded-lg resize-none focus:outline-none focus:border-subCoral"
          maxLength={200}
        />
        <p className="mt-1 text-right text-11 text-mainGray">
          {formState.memo.length}/200
        </p>
      </section>

      {/* 캡처용 숨겨진 영역 */}
      <div className="fixed left-[-9999px] top-0">
        <TastingNoteCapture
          ref={captureRef}
          alcoholName={alcoholName}
          alcoholImage={alcoholImage}
          data={formState}
          memo={formState.memo}
          date={today}
        />
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-mainGray/30 max-w-[500px] mx-auto">
        <button
          onClick={handleSaveImage}
          disabled={isCapturing}
          className="w-full py-4 bg-subCoral text-white text-16 font-bold rounded-xl disabled:opacity-50"
        >
          {isCapturing ? '저장 중...' : '이미지로 저장'}
        </button>
      </div>
    </div>
  );
}
```

---

## Task 9: 테이스팅 노트 페이지

**Files:**

- Create: `src/app/(primary)/tasting-note/[alcoholId]/page.tsx`

**Step 1: 페이지 컴포넌트 작성**

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import NavLayout from '@/components/ui/Layout/NavLayout';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { AlcoholInfo } from '@/api/alcohol/types';

import TastingNoteForm from './_components/TastingNoteForm';

export default function TastingNotePage() {
  const router = useRouter();
  const params = useParams();
  const alcoholId = params.alcoholId as string;

  const [alcohol, setAlcohol] = useState<AlcoholInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlcohol = async () => {
      try {
        const response = await AlcoholsApi.getAlcoholDetails(alcoholId);
        if (response?.data?.alcohols) {
          setAlcohol(response.data.alcohols);
        }
      } catch (error) {
        console.error('Failed to fetch alcohol:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (alcoholId) {
      fetchAlcohol();
    }
  }, [alcoholId]);

  if (isLoading) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-mainGray">로딩 중...</p>
        </div>
      </NavLayout>
    );
  }

  if (!alcohol) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-mainGray">위스키 정보를 찾을 수 없습니다.</p>
        </div>
      </NavLayout>
    );
  }

  return (
    <NavLayout>
      <SubHeader bgColor="bg-white">
        <SubHeader.Left onClick={() => router.back()}>
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="back"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center>테이스팅 노트</SubHeader.Center>
      </SubHeader>

      {/* 위스키 정보 헤더 */}
      <div className="px-5 py-4 border-b border-mainGray/30">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {alcohol.alcoholUrlImg && (
              <Image
                src={alcohol.alcoholUrlImg}
                alt={alcohol.korName}
                fill
                className="object-contain"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-16 font-bold text-mainDarkGray truncate">
              {alcohol.korName}
            </p>
            <p className="text-12 text-mainGray truncate">{alcohol.engName}</p>
          </div>
        </div>
      </div>

      <TastingNoteForm
        alcoholId={alcoholId}
        alcoholName={alcohol.korName}
        alcoholImage={alcohol.alcoholUrlImg}
      />
    </NavLayout>
  );
}
```

---

## Task 10: 위스키 상세 페이지에 진입 버튼 추가

**Files:**

- Create: `src/app/(primary)/search/[category]/[id]/_components/FloatingTastingButton.tsx`
- Modify: `src/app/(primary)/search/[category]/[id]/page.tsx`

**Step 1: FloatingTastingButton 컴포넌트 작성**

```typescript
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useScrollState } from '@/hooks/useScrollState';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';

interface Props {
  alcoholId: string;
}

export default function FloatingTastingButton({ alcoholId }: Props) {
  const router = useRouter();
  const { isAtTop, isVisible } = useScrollState();
  const { isLoggedIn } = useAuth();
  const { handleLoginModal } = useModalStore();

  const handleClick = () => {
    if (!isLoggedIn) {
      handleLoginModal();
      return;
    }
    router.push(`/tasting-note/${alcoholId}`);
  };

  const getPositionClass = () => {
    const basePosition = isVisible ? 'bottom-[175px]' : 'bottom-[74px]';
    return `${basePosition} right-[max(16px,calc((100vw-468px)/2+16px))]`;
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed z-20 transition-all duration-300 ease-in-out bg-white border-2 border-subCoral text-subCoral rounded-full shadow-lg hover:shadow-xl ${getPositionClass()}`}
      style={{
        width: isAtTop ? 'auto' : '52px',
        height: '52px',
        paddingLeft: isAtTop ? '16px' : '0px',
        paddingRight: isAtTop ? '16px' : '0px',
      }}
    >
      <div className="flex items-center justify-center h-full">
        <Image
          src="/icon/chart-subcoral.svg"
          alt="tasting"
          width={20}
          height={20}
          className="flex-shrink-0"
        />
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: isAtTop ? 'auto' : '0px',
            opacity: isAtTop ? 1 : 0,
            marginLeft: isAtTop ? '12px' : '0px',
          }}
        >
          <p className="text-14 font-bold whitespace-nowrap">테이스팅</p>
        </div>
      </div>
    </button>
  );
}
```

**Step 2: 상세 페이지에 import 추가**

`src/app/(primary)/search/[category]/[id]/page.tsx` 파일의 import 섹션에 추가:

```typescript
import FloatingTastingButton from './_components/FloatingTastingButton';
```

**Step 3: 상세 페이지에 버튼 컴포넌트 추가**

`src/app/(primary)/search/[category]/[id]/page.tsx` 파일의 369번째 줄 근처, `FloatingReviewButton` 바로 위에 추가:

```typescript
{data?.alcohols?.alcoholId && (
  <FloatingTastingButton alcoholId={String(data.alcohols.alcoholId)} />
)}
```

---

## Task 11: 차트 아이콘 추가

**Files:**

- Create: `public/icon/chart-subcoral.svg`

**Step 1: SVG 아이콘 파일 생성**

```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 2L12.09 7.26L18 8.27L14 12.14L15.18 18L10 15.27L4.82 18L6 12.14L2 8.27L7.91 7.26L10 2Z" stroke="#FF6B35" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## Task 12: 빌드 및 테스트

**Step 1: 타입 체크**

Run: `pnpm run ci:tsc`
Expected: 에러 없음

**Step 2: 린트 체크**

Run: `pnpm run lint`
Expected: 에러 없음

**Step 3: 개발 서버 실행**

Run: `pnpm run dev:local`

**Step 4: 기능 테스트**

1. 위스키 상세 페이지 접근
2. "테이스팅" 플로팅 버튼 확인
3. 버튼 클릭 → 테이스팅 노트 페이지 이동
4. 슬라이더 조작 → 차트 실시간 반영 확인
5. 메모 입력
6. "이미지로 저장" 버튼 클릭 → PNG 다운로드 확인

---

## 파일 생성 순서 요약

1. `pnpm add recharts html2canvas && pnpm add -D @types/html2canvas`
2. `src/app/(primary)/tasting-note/[alcoholId]/types.ts`
3. `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingRadarChart.tsx`
4. `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingSlider.tsx`
5. `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingSliderGroup.tsx`
6. `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingNoteCapture.tsx`
7. `src/app/(primary)/tasting-note/[alcoholId]/_hooks/useTastingNoteCapture.ts`
8. `src/app/(primary)/tasting-note/[alcoholId]/_components/TastingNoteForm.tsx`
9. `src/app/(primary)/tasting-note/[alcoholId]/page.tsx`
10. `src/app/(primary)/search/[category]/[id]/_components/FloatingTastingButton.tsx`
11. `src/app/(primary)/search/[category]/[id]/page.tsx` (수정)
12. `public/icon/chart-subcoral.svg`
