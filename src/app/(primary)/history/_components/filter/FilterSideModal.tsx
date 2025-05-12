import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import BackDrop from '@/components/BackDrop';
import {
  RATINGS_FILTERS,
  REVIEW_FILTERS,
  LIKE_FILTERS,
} from '@/constants/history';
import { useHistoryFilterStore } from '@/store/historyFilterStore';
import FilterContainer from './FilterContainer';
import CloseGrayIcon from 'public/icon/close-gray.svg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSideModal({ isOpen, onClose }: Props) {
  const { resetFilter } = useHistoryFilterStore();

  const modalVariants = {
    initial: { x: '100%' },
    animate: { x: 0, transition: { type: 'tween' } },
    exit: { x: '100%', transition: { type: 'tween' } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <BackDrop isShow={isOpen} onBackdropClick={onClose}>
            <motion.section
              className="z-50 w-72 bg-white fixed right-0 top-0 h-full pt-16 flex flex-col"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={modalVariants}
            >
              <header className="flex items-center justify-between border-b border-brightGray pb-3 px-5">
                <button
                  className="border border-brightGray text-10 px-[10px] py-[2px] rounded"
                  onClick={() => resetFilter()}
                >
                  초기화
                </button>
                <h3 className="absolute left-1/2 -translate-x-1/2">필터</h3>
                <button onClick={onClose}>
                  <Image src={CloseGrayIcon} alt="close" />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto">
                <FilterContainer title="별점" data={RATINGS_FILTERS} />
                <FilterContainer
                  title="리뷰"
                  data={REVIEW_FILTERS}
                  gridCols={3}
                />
                <FilterContainer title="찜" data={LIKE_FILTERS} />
                <FilterContainer title="기간" type="DATE" />
              </div>
            </motion.section>
          </BackDrop>
        </>
      )}
    </AnimatePresence>
  );
}
