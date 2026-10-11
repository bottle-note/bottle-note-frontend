import { createContext, useContext, type ReactNode } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import Button, { buttonVariants } from '@/components/ui/Button/Button';
import { cn } from '@/lib/utils';

export type Option = {
  title: string;
  description?: string;
  action: () => void;
};

export const ActionDockContext = createContext<HTMLElement | null | undefined>(
  undefined,
);

function DockItem({ children }: { children: ReactNode }) {
  const dock = useContext(ActionDockContext);
  if (dock === undefined) return children;
  return dock ? createPortal(children, dock) : null;
}

export function OptionList({ items }: { items: Option[] }) {
  return (
    <div className="flex flex-col gap-6">
      {items.map(({ title, description, action }) => (
        <button
          key={title}
          className="flex min-h-48 w-full flex-col justify-center gap-2 rounded-lg border border-transparent bg-bg-neutral-weak px-14 py-10 text-left text-fg-neutral transition-colors duration-150 hover:border-stroke-brand-solid hover:bg-bg-brand-weak focus-visible:border-stroke-brand-solid focus-visible:bg-bg-brand-weak focus-visible:outline-none [&:hover>b]:text-fg-brand [&:focus-visible>b]:text-fg-brand"
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
      ))}
    </div>
  );
}

export function FlowAction({
  children,
  onClick,
  primary = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <DockItem>
      <Button
        size={primary ? 'lg' : 'md'}
        variant={primary ? 'primary' : 'secondary'}
        fullWidth
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </Button>
    </DockItem>
  );
}

export function flowLinkClassName(primary = false) {
  return cn(
    buttonVariants({
      size: primary ? 'lg' : 'md',
      variant: primary ? 'primary' : 'secondary',
      fullWidth: true,
    }),
    'no-underline',
  );
}

export function FlowLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <DockItem>
      <Link className={flowLinkClassName(primary)} href={href}>
        {children}
      </Link>
    </DockItem>
  );
}
