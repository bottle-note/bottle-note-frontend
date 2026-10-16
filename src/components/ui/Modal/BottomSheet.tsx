'use client';

import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number; // vh 단위 (기본값: 80)
  className?: string;
  /** 다른 전체 화면 레이어 위에 띄울 때 겹침 순서를 맞춘다. */
  overlayClassName?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  height = 80,
  className = '',
  overlayClassName = '',
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={cn('fixed inset-0 z-40 bg-bg-overlay', overlayClassName)}
        />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-bg-layer-floating text-fg-neutral max-w-content mx-auto',
            className,
          )}
          style={{ height: `${height}vh` }}
        >
          <Drawer.Handle className="mx-auto mt-16 h-6 w-48 flex-shrink-0 rounded-full bg-bg-disabled" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
