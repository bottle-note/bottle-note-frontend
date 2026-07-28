'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/Modal/BottomSheet';
import { ThemePreference, useTheme } from '@/lib/theme/ThemeProvider';

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    value: 'system',
    label: '시스템 설정 따르기',
    description: '기기의 화면 모드를 따릅니다.',
  },
  {
    value: 'light',
    label: '라이트 모드',
    description: '밝은 화면으로 표시합니다.',
  },
  {
    value: 'dark',
    label: '다크 모드',
    description: '어두운 화면으로 표시합니다.',
  },
];

export const SettingsAppearanceSection = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { preference, theme, setThemePreference } = useTheme();
  const selectedOption = THEME_OPTIONS.find(
    (option) => option.value === preference,
  );

  const handleSelect = (nextPreference: ThemePreference) => {
    setThemePreference(nextPreference);
    setIsSheetOpen(false);
  };

  return (
    <section className="py-[22px]">
      <h2 className="text-subCoral text-13 font-bold">화면 설정</h2>
      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isSheetOpen}
        className="mt-[27px] flex w-full items-center justify-between text-left text-15 font-medium text-mainBlack"
      >
        <span>화면 모드</span>
        <span className="text-mainGray">{selectedOption?.label}</span>
      </button>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="화면 모드"
        description="화면 모드를 선택할 수 있습니다."
        height={66}
        className="bg-bn-raised text-bn-text"
      >
        <div className="px-6 pb-safe pt-6">
          <p className="text-20 font-bold">화면 모드</p>
          <div
            role="radiogroup"
            aria-label="화면 모드 선택"
            className="mt-5 space-y-2"
          >
            {THEME_OPTIONS.map((option) => {
              const isSelected = option.value === preference;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className="flex min-h-14 w-full items-center justify-between rounded-xl border border-bn-border px-4 text-left"
                >
                  <span>
                    <span className="block text-15 font-bold">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-12 text-bn-text-secondary">
                      {option.description}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-5 w-5 rounded-full border-2 ${
                      isSelected
                        ? 'border-bn-accent-interactive bg-bn-accent-interactive shadow-[inset_0_0_0_3px_hsl(var(--bn-raised))]'
                        : 'border-bn-border-strong'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-12 text-bn-text-secondary">
            현재 적용 중: {theme === 'dark' ? '다크 모드' : '라이트 모드'}
          </p>
        </div>
      </BottomSheet>
    </section>
  );
};
