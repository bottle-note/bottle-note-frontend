import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCollapse from '@/components/ui/Display/AnimatedCollapse';

interface AccordionItemWrapperProps {
  title: string;
  subTitle?: string;
  forceOpen?: boolean;
}

const AccordionItemWrapper = ({
  title,
  subTitle,
  forceOpen,
  children,
}: React.PropsWithChildren<AccordionItemWrapperProps>) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (forceOpen) setIsOpen(forceOpen);
  }, [forceOpen]);

  return (
    <>
      {/* 토글 헤더 */}
      <div className="flex items-center justify-between border-b border-stroke-neutral-basement px-20 py-12">
        <div className="flex items-center space-x-4">
          <p className="text-12 font-bold text-fg-neutral">
            {title}
            <span className="font-normal text-fg-neutral-muted">
              {subTitle}
            </span>
          </p>
        </div>
        <button
          type="button"
          aria-label={`${title} 필터 ${isOpen ? '접기' : '펼치기'}`}
          aria-expanded={isOpen}
          className="flex cursor-pointer items-center rounded-sm text-fg-neutral-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
          onClick={handleOpen}
        >
          <ChevronDown
            aria-hidden
            className={`h-16 w-16 transform transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      </div>

      {/* 컨텐츠 */}
      <AnimatedCollapse isOpen={isOpen}>
        <div className="bg-bg-neutral-weak px-20 py-12">{children}</div>
      </AnimatedCollapse>
    </>
  );
};

const AccordionItemSingleContainer = ({
  children,
}: React.PropsWithChildren) => {
  return <div className="mb-4">{children}</div>;
};

interface AccordionItemGridContainerProps {
  cols?: number;
}

const AccordionItemGridContainer = ({
  cols = 2,
  children,
}: React.PropsWithChildren<AccordionItemGridContainerProps>) => {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
};

interface AccordionContentProps {
  title: string;
  value: string;
  IconComponent?: React.FC<{
    color?: string;
    className?: string;
    size?: number;
  }>;
  isSelected: boolean;
  onClick?: (name: string) => void;
}

const AccordionItemContent = ({
  title,
  value,
  IconComponent,
  isSelected = false,
  onClick,
}: AccordionContentProps) => {
  const baseStyles = `
    flex h-36 w-full min-w-74 items-center justify-center rounded border px-12
    text-11 font-semibold transition-all duration-200 ease-in-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring
    ${
      isSelected
        ? 'border-stroke-brand-primary-solid bg-bg-brand-primary-solid text-fg-brand-contrast'
        : 'border-stroke-neutral-subtle bg-bg-layer-default text-fg-neutral-muted hover:bg-bg-layer-default-pressed'
    }
  `;

  const contentStyles = cn(
    'flex items-center gap-8',
    IconComponent ? 'w-full justify-between' : 'justify-center',
  );

  const renderTitle = () => {
    if (title.includes('/')) {
      const slashIndex = title.indexOf('/');
      const firstPart = title.substring(0, slashIndex + 1);
      const secondPart = title.substring(slashIndex + 1);
      return (
        <span className="flex flex-col items-center leading-tight">
          <span>{firstPart}</span>
          <span>{secondPart}</span>
        </span>
      );
    }
    return <span>{title}</span>;
  };

  return (
    <button
      type="button"
      className={baseStyles}
      onClick={() => onClick && onClick(value)}
      aria-pressed={isSelected}
    >
      <div className={contentStyles}>
        {IconComponent && (
          <div className="flex items-center gap-4">
            {IconComponent && (
              <IconComponent
                color={
                  isSelected
                    ? 'var(--color-fg-brand-contrast)'
                    : 'var(--color-fg-neutral-muted)'
                }
              />
            )}
            {renderTitle()}
          </div>
        )}
        {!IconComponent && renderTitle()}
      </div>
    </button>
  );
};

export const Accordion = Object.assign(AccordionItemWrapper, {
  Single: AccordionItemSingleContainer,
  Grid: AccordionItemGridContainer,
  Content: AccordionItemContent,
});
