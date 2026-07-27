'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MenuCategory } from '@/types/Settings';
import { SettingsMiniEventList } from './SettingsMiniEventList';
import { SettingsAppearanceSection } from './SettingsAppearanceSection';

interface SettingsMainScreenProps {
  menuCategories: MenuCategory[];
}

const containerVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const SettingsMainScreen = ({
  menuCategories,
}: SettingsMainScreenProps) => {
  return (
    <motion.section
      className="flex-1 overflow-y-auto bg-white px-6 text-mainBlack dark:bg-bn-canvas dark:text-bn-text"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <SettingsMiniEventList />
      <SettingsAppearanceSection />

      {menuCategories.map((category) => (
        <div key={category.title}>
          <div className="border-t border-brightGray dark:border-bn-border-subtle" />
          <div className="py-[22px]">
            <h2 className="text-subCoral dark:text-bn-accent-interactive text-13 font-bold">
              {category.title}
            </h2>
            <div className="mt-[27px] space-y-[25px] text-15 font-medium text-mainBlack dark:text-bn-text">
              {category.items.map((item) => {
                const isExternalLink =
                  item.link?.startsWith('http://') ||
                  item.link?.startsWith('https://');

                return (
                  <div key={item.text}>
                    {item.action && (
                      <button
                        onClick={item.action}
                        className="w-full text-left"
                      >
                        {item.text}
                      </button>
                    )}
                    {item.link && (
                      <Link
                        href={item.link}
                        target={isExternalLink ? '_blank' : undefined}
                        rel={isExternalLink ? 'noopener noreferrer' : undefined}
                        className="block"
                      >
                        {item.text}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <div className="border-t border-brightGray py-[22px] dark:border-bn-border-subtle">
        <div className="flex items-center justify-between text-15 text-brightGray dark:text-bn-text-tertiary">
          <span>빌드 {process.env.NEXT_PUBLIC_BUILD_TIME}</span>
        </div>
      </div>
    </motion.section>
  );
};
