'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MenuCategory } from '@/types/Settings';
import { SettingsMiniEventList } from './SettingsMiniEventList';

interface SettingsMainScreenProps {
  menuCategories: MenuCategory[];
  isLoggedIn: boolean;
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
  isLoggedIn,
}: SettingsMainScreenProps) => {
  return (
    <motion.section
      className="flex-1 overflow-y-auto px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isLoggedIn && <SettingsMiniEventList />}

      {menuCategories.map((category, categoryIndex) => (
        <div key={category.title}>
          {categoryIndex > 0 && (
            <div className="border-t border-stroke-neutral-subtle" />
          )}
          <div className="py-[22px]">
            <h2 className="text-fg-brand text-13 font-bold">
              {category.title}
            </h2>
            <div className="mt-[27px] space-y-[25px] text-15 font-medium text-fg-neutral">
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

      <div className="py-[22px] border-t border-stroke-neutral-subtle">
        <div className="flex justify-between items-center text-15 text-fg-disabled">
          <span>빌드 {process.env.NEXT_PUBLIC_BUILD_TIME}</span>
        </div>
      </div>
    </motion.section>
  );
};
