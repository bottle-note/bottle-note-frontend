import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center justify-between border-b border-stroke-neutral-subtle px-5 py-3">
        <div className="flex items-center space-x-1">
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
            className={`h-4 w-4 transform transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      </div>

      {/* 컨텐츠 */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`transform transition-all duration-500 ease-out ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="bg-bg-neutral-weak px-5 py-3">{children}</div>
        </div>
      </div>
    </>
  );
};

const AccordionItemSingleContainer = ({
  children,
}: React.PropsWithChildren) => {
  return <div className="mb-1">{children}</div>;
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
      className="grid gap-1"
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
    flex h-9 w-full min-w-[74px] items-center justify-center rounded border px-3
    text-11 font-semibold transition-all duration-200 ease-in-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring
    ${
      isSelected
        ? 'border-stroke-brand-solid bg-bg-brand-solid text-fg-brand-contrast'
        : 'border-stroke-neutral-subtle bg-bg-layer-default text-fg-neutral-muted hover:bg-bg-layer-default-pressed'
    }
  `;

  const contentStyles = cn(
    'flex items-center gap-2',
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
          <div className="flex items-center gap-1">
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
        {isSelected && <Check aria-hidden className="h-4 w-4" />}
      </div>
    </button>
  );
};

export const Accordion = Object.assign(AccordionItemWrapper, {
  Single: AccordionItemSingleContainer,
  Grid: AccordionItemGridContainer,
  Content: AccordionItemContent,
});
