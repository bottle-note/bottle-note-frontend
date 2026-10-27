import { createContext, useContext, type ReactNode } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button/Button';

export interface Option {
  id?: string;
  title: string;
  description?: string;
  disabled?: boolean;
  /** 방금 고른 보기. 다음 화면이 올 때까지 고른 모습으로 남긴다. */
  selected?: boolean;
  action: () => void;
}

export const ActionDockContext = createContext<HTMLElement | null | undefined>(
  undefined,
);

export function FlowDock({ children }: { children: ReactNode }) {
  const dock = useContext(ActionDockContext);
  if (dock === undefined) return children;
  return dock ? createPortal(children, dock) : null;
}

export function OptionList({
  items,
  disabled = false,
}: {
  items: Option[];
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {items.map(
        ({
          id,
          title,
          description,
          action,
          disabled: optionDisabled,
          selected,
        }) => (
          <button
            key={id ?? title}
            disabled={disabled || optionDisabled}
            aria-pressed={selected || undefined}
            className="flex min-h-48 w-full flex-col justify-center gap-2 rounded-lg border border-transparent bg-bg-neutral-weak px-14 py-10 text-left text-fg-neutral transition-[color,background-color,border-color,opacity] duration-150 hover:border-stroke-brand-solid hover:bg-bg-brand-weak focus-visible:border-stroke-brand-solid focus-visible:bg-bg-brand-weak focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 aria-pressed:border-stroke-brand-solid aria-pressed:bg-bg-brand-weak aria-pressed:opacity-100 [&:focus-visible>b]:text-fg-brand [&:hover>b]:text-fg-brand [&[aria-pressed=true]>b]:text-fg-brand"
            type="button"
            onClick={action}
          >
            <b className="text-15 font-bold leading-20">{title}</b>
            {description && (
              <span className="text-13 leading-17 text-fg-neutral-muted">
                {description}
              </span>
            )}
          </button>
        ),
      )}
    </div>
  );
}

export function FlowAction({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <FlowDock>
      <Button size="lg" variant="primary" disabled={disabled} onClick={onClick}>
        {children}
      </Button>
    </FlowDock>
  );
}

const navigationClassName =
  'inline-flex min-h-40 items-center text-13 font-semibold text-fg-neutral-muted underline decoration-stroke-neutral-weak underline-offset-4 transition-colors hover:text-fg-brand focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring';

export function FlowNavigation({ children }: { children: ReactNode }) {
  return (
    <nav
      aria-label="다른 보기"
      className="flex flex-wrap items-center gap-x-16 gap-y-2 border-t border-stroke-neutral-subtle pt-8"
    >
      {children}
    </nav>
  );
}

export function FlowTextAction({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={navigationClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function FlowTextLink({
  children,
  href,
  onClick,
}: {
  children: ReactNode;
  href: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} className={navigationClassName} onClick={onClick}>
      {children}
    </Link>
  );
}
