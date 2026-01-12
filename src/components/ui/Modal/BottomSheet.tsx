'use client';

import { Drawer } from 'vaul';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number; // vh 단위 (기본값: 80)
  className?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  height = 80,
  className = '',
}: BottomSheetProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content
          className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white max-w-content mx-auto ${className}`}
          style={{ height: `${height}vh` }}
        >
          <Drawer.Handle className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
