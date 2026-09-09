import { cn } from '@/lib/utils';

interface ListItemLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ListItemLayout = ({ children, className }: ListItemLayoutProps) => {
  return (
    <article
      className={cn(
        'flex w-full items-center border-b border-stroke-neutral-subtle py-4 text-fg-neutral',
        className,
      )}
    >
      {children}
    </article>
  );
};

export default ListItemLayout;
