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
            <motion.section
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-bg-layer-floating pt-16 text-fg-neutral"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={modalVariants}
            >
              <header className="flex items-center justify-between border-b border-stroke-neutral-subtle px-5 pb-3">
                <button
                  type="button"
                  className="rounded border border-stroke-neutral-weak px-[10px] py-[2px] text-10 text-fg-neutral-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
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
                  <X aria-hidden className="h-5 w-5" />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.section>
          </BackDrop>
        </>
      )}
    </AnimatePresence>
  );
}
