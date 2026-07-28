'use client';

import { Drawer } from 'vaul';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number; // vh 단위 (기본값: 80)
  className?: string;
  title?: string;
  description?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  height = 80,
  className = '',
  title = '바텀 시트',
  description = '선택 가능한 옵션 목록입니다.',
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content
          className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-bn-raised text-bn-text max-w-content mx-auto ${className}`}
          style={{ height: `${height}vh` }}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {description}
          </Drawer.Description>
          <Drawer.Handle className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-bn-border-strong" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
