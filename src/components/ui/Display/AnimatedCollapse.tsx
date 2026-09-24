import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  children: ReactNode;
  collapsedHeight?: number;
  className?: string;
  onCollapseComplete?: () => void;
}

export default function AnimatedCollapse({
  isOpen,
  children,
  collapsedHeight = 0,
  className,
  onCollapseComplete,
}: Props) {
  const shouldReduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.inert = !isOpen && collapsedHeight === 0;
    }
  }, [isOpen, collapsedHeight]);

  return (
    <motion.div
      ref={contentRef}
      initial={false}
      animate={{
        height: isOpen ? 'auto' : collapsedHeight,
        opacity: isOpen || collapsedHeight > 0 ? 1 : 0,
      }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (!isOpen) onCollapseComplete?.();
      }}
      aria-hidden={!isOpen && collapsedHeight === 0}
      className={`overflow-hidden ${className ?? ''}`}
    >
      {children}
    </motion.div>
  );
}
