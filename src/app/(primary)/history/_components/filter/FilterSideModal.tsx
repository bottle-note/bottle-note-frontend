import React from 'react';
import Image from 'next/image';
import BackDrop from '@/components/BackDrop';
import {
  RATINGS_FILTERS,
  REVIEW_FILTERS,
  LIKE_FILTERS,
} from '@/constants/history';
import FilterContainer from './FilterContainer';
import CloseGrayIcon from 'public/icon/close-gray.svg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSideModal({ isOpen, onClose }: Props) {
  return (
    <>
      {isOpen && (
        <BackDrop isShow={isOpen}>
          <section className="z-50 w-72 bg-white fixed right-0 top-0 h-full pt-16">
            <header className="flex items-center justify-center gap-[5.5rem] border-b border-brightGray pb-3">
              <button
                className="border border-brightGray text-10 px-[10px] py-[2px] rounded"
                onClick={onClose}
              >
                초기화
              </button>
              <h3>필터</h3>
              <button onClick={onClose}>
                <Image src={CloseGrayIcon} alt="close" />
              </button>
            </header>
            <FilterContainer title="별점" data={RATINGS_FILTERS} />
            <FilterContainer title="리뷰" data={REVIEW_FILTERS} gridCols={3} />
            <FilterContainer title="찜" data={LIKE_FILTERS} />
            <FilterContainer title="기간" type="DATE" />
          </section>
        </BackDrop>
      )}
    </>
  );
}
