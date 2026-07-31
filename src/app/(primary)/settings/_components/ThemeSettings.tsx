'use client';

import { useTheme } from '@/lib/theme/ThemeProvider';
import { ThemePreference } from '@/lib/theme/theme';

interface ThemeOption {
  value: ThemePreference;
  label: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'system',
    label: '시스템 설정',
    description: '기기의 라이트·다크 모드 설정을 자동으로 따라갑니다.',
  },
  {
    value: 'light',
    label: '라이트 모드',
    description: '기기 설정과 관계없이 밝은 화면을 사용합니다.',
  },
  {
    value: 'dark',
    label: '다크 모드',
    description: '기기 설정과 관계없이 어두운 화면을 사용합니다.',
  },
];

export default function ThemeSettings() {
  const { preference, isInitialized, setPreference } = useTheme();

  return (
    <div className="px-6 py-[22px]">
      <div
        role="radiogroup"
        aria-label="화면 테마"
        aria-busy={!isInitialized}
        className="overflow-hidden rounded-xl border border-stroke-neutral-subtle bg-bg-layer-floating"
      >
        {THEME_OPTIONS.map((option, index) => {
          const isSelected = preference === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!isInitialized}
              onClick={() => setPreference(option.value)}
              className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors active:bg-bg-layer-default-pressed disabled:cursor-wait ${
                index === 0 ? '' : 'border-t border-stroke-neutral-subtle'
              }`}
            >
              <span>
                <span className="block text-15 font-bold text-fg-neutral">
                  {option.label}
                </span>
                <span className="mt-1 block text-12 text-fg-neutral-muted">
                  {option.description}
                </span>
              </span>

              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? 'border-stroke-brand-solid'
                    : 'border-stroke-neutral-weak'
                }`}
              >
                {isSelected && (
                  <span className="h-3 w-3 rounded-full bg-bg-brand-solid" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
