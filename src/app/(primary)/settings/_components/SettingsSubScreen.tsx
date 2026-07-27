'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScreenConfig, ScreenType } from '@/types/Settings';

interface SettingsSubScreenProps {
  screenType: Exclude<ScreenType, 'main'>;
  config: ScreenConfig;
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

export const SettingsSubScreen = ({ config }: SettingsSubScreenProps) => {
  if (config.component) {
    const Component = config.component;
    return (
      <motion.section
        className="flex-1 overflow-y-auto bg-white text-mainBlack dark:bg-bn-canvas dark:text-bn-text"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Component />
      </motion.section>
    );
  }

  return (
    <motion.section
      className="flex-1 overflow-y-auto bg-white px-6 dark:bg-bn-canvas"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-0 border-b border-brightGray py-[22px] text-15 font-medium text-mainBlack dark:border-bn-border-subtle dark:text-bn-text">
        {config.items?.map((item, index) => (
          <div key={item.text} className={index === 0 ? '' : 'pt-[25px]'}>
            {item.action && (
              <button onClick={item.action} className="w-full text-left">
                {item.text}
              </button>
            )}
            {item.link && (
              <Link
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {item.text}
              </Link>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
};
