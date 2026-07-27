'use client';

import Toggle from '@/components/ui/Form/Toggle';
import { useTheme } from '@/lib/theme/ThemeProvider';

export const SettingsAppearanceSection = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <section className="py-[22px]">
      <h2 className="text-subCoral dark:text-bn-accent-interactive text-13 font-bold">
        화면 설정
      </h2>
      <div className="mt-[27px] flex items-center justify-between text-15 font-medium text-mainBlack dark:text-bn-text">
        <span>다크 모드</span>
        <Toggle
          isActive={isDarkMode}
          onToggle={toggleTheme}
          onName="다크 모드 켜짐"
          offName="다크 모드 꺼짐"
          onColor="bg-bn-accent-interactive"
          offColor="bg-mainGray dark:bg-bn-border-strong"
          textSize="sr-only"
        />
      </div>
    </section>
  );
};
