'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import {
  TASTING_AXES,
  DEFAULT_TASTING_NOTE,
  type TastingNoteValues,
} from '@/constants/tastingNote';
import { FormValues } from '@/types/Review';
import TastingRadarChart from './TastingRadarChart';
import FlavorAxisControl from './FlavorAxisControl';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TastingNoteModal({ isOpen, onClose }: Props) {
  const { setValue, watch } = useFormContext<FormValues>();
  const tastingNote: TastingNoteValues = watch('tastingNote') ?? {
    ...DEFAULT_TASTING_NOTE,
  };

  const [activeAxis, setActiveAxis] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAxisChange = (key: keyof TastingNoteValues, value: number) => {
    setActiveAxis(key);
    const updated = { ...tastingNote, [key]: value };
    setValue('tastingNote', updated, { shouldDirty: true });
  };

  const handleReset = () => {
    setActiveAxis(null);
    setValue('tastingNote', { ...DEFAULT_TASTING_NOTE }, { shouldDirty: true });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-white flex flex-col max-w-content mx-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {/* 헤더 */}
          <header className="flex items-center justify-between px-5 py-3 border-b border-bgGray">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 text-14 text-mainGray"
            >
              <Image
                src="/icon/arrow-left-subcoral.svg"
                alt="back"
                width={20}
                height={20}
              />
            </button>
            <h2 className="text-16 font-bold text-mainDarkGray">
              테이스팅 노트
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-14 font-bold text-subCoral"
            >
              완료
            </button>
          </header>

          {/* 콘텐츠 */}
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            {/* 안내 텍스트 */}
            <motion.div
              className="pt-5 pb-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-14 text-mainDarkGray font-medium">
                이 위스키에서 느낀 풍미를 기록해보세요
              </p>
              <p className="text-12 text-mainGray mt-1">
                차트를 탭하거나 슬라이더로 조절하세요
              </p>
            </motion.div>

            {/* 레이더 차트 */}
            <motion.div
              className="flex justify-center py-4"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 20 }}
            >
              <div className="w-[280px] h-[280px]">
                <TastingRadarChart
                  values={tastingNote}
                  size={280}
                  activeAxis={activeAxis}
                  onAxisChange={handleAxisChange}
                />
              </div>
            </motion.div>

            {/* 슬라이더 컨트롤들 */}
            <div className="flex flex-col gap-5 mt-2">
              {TASTING_AXES.map((axis, i) => (
                <motion.div
                  key={axis.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                >
                  <FlavorAxisControl
                    label={axis.label}
                    labelKo={axis.labelKo}
                    guide={axis.guide}
                    value={tastingNote[axis.key]}
                    onChange={(v) => handleAxisChange(axis.key, v)}
                  />
                </motion.div>
              ))}
            </div>

            {/* 초기화 버튼 */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={handleReset}
                className="text-13 text-mainGray underline underline-offset-2"
              >
                초기화
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
