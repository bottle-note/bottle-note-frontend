'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScreenConfig, ScreenType } from '@/types/Settings';

interface SettingsSubScreenProps {
  screenType: Exclude<ScreenType, 'main'>;
  config: ScreenConfig;
}

const itemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      type: 'spring',
      stiffness: 100,
    },
  }),
};

export const SettingsSubScreen = ({ config }: SettingsSubScreenProps) => {
  if (config.component) {
    const Component = config.component;
    return (
      <section className="flex-1 overflow-y-auto">
        <Component />
      </section>
    );
  }

  return (
    <section className="flex-1 overflow-y-auto px-6">
      <div className="space-y-0 py-[22px] text-15 font-medium text-mainBlack border-b border-brightGray">
        {config.items?.map((item, index) => (
          <motion.div
            key={item.text}
            className={index === 0 ? '' : 'pt-[25px]'}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            custom={index}
          >
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
          </motion.div>
        ))}
      </div>
    </section>
  );
};
