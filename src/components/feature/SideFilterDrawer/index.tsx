import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import BackDrop from '@/components/ui/Modal/BackDrop';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resetFilter: () => void;
}

export default function SideFilterDrawer({
  isOpen,
  onClose,
  resetFilter,
  children,
}: React.PropsWithChildren<Props>) {
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
            {/* 콘텐츠 영역 밖(양옆 배경)에서 미끄러져 들어오지 않도록 콘텐츠 폭으로 잘라낸다. */}
            <div className="fixed-content inset-y-0 z-50 overflow-hidden pointer-events-none">
              <motion.section
                className="pointer-events-auto absolute right-0 top-0 flex h-full w-288 flex-col bg-bg-layer-floating pb-[var(--safe-area-bottom)] pt-64 text-fg-neutral"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={modalVariants}
              >
                <header className="flex items-center justify-between border-b border-stroke-neutral-subtle px-20 pb-12">
                  <button
                    type="button"
                    className="rounded border border-stroke-neutral-weak px-10 py-2 text-10 text-fg-neutral-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
                    onClick={() => resetFilter()}
                  >
                    초기화
                  </button>
                  <h3 className="absolute left-1/2 -translate-x-1/2 font-semibold text-fg-neutral">
                    필터
                  </h3>
                  <button
                    type="button"
                    aria-label="필터 닫기"
                    className="rounded-sm text-fg-neutral-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
                    onClick={onClose}
                  >
                    <X aria-hidden className="h-20 w-20" />
                  </button>
                </header>
                <div className="flex-1 overflow-y-auto">{children}</div>
              </motion.section>
            </div>
          </BackDrop>
        </>
      )}
    </AnimatePresence>
  );
}
