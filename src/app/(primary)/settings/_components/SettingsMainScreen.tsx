'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MenuCategory } from '@/types/Settings';

interface SettingsMainScreenProps {
  menuCategories: MenuCategory[];
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

export const SettingsMainScreen = ({
  menuCategories,
}: SettingsMainScreenProps) => {
  return (
    <section className="flex-1 overflow-y-auto px-6">
      {menuCategories.map((category, categoryIndex) => (
        <div key={category.title}>
          {categoryIndex > 0 && <div className="border-t border-brightGray" />}
          <div className="py-[22px]">
            <h2 className="text-subCoral text-13 font-bold">
              {category.title}
            </h2>
            <div className="mt-[27px] space-y-[25px] text-15 font-medium text-mainBlack">
              {category.items.map((item, index) => (
                <motion.div
                  key={item.text}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={categoryIndex * 3 + index}
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
          </div>
        </div>
      ))}

      <div className="py-[22px] border-t border-brightGray">
        <div className="flex justify-between items-center text-15 text-brightGray">
          <span>앱 버전 1.1.4</span>
        </div>
      </div>
    </section>
  );
};
