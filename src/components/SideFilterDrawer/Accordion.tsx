import { useEffect, useState } from 'react';
import Image from 'next/image';
import CheckedIcon from 'public/icon/check-white.svg';
import ArrowIcon from 'public/icon/arrow-down-darkgray.svg';

interface AccordionItemWrapperProps {
  title: string;
  subTitle?: string;
  toggleIcon?: string;
  forceOpen?: boolean;
}

const AccordionItemWrapper = ({
  title,
  subTitle,
  toggleIcon = ArrowIcon,
  forceOpen,
  children,
}: React.PropsWithChildren<AccordionItemWrapperProps>) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (forceOpen) setIsOpen(forceOpen);
  }, [forceOpen]);

  return (
    <>
      {/* 토글 헤더 */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-bgGray">
        <div className="flex items-center space-x-1">
          <p className="text-12 text-mainDarkGray font-bold">
            {title}
            <span className="text-mainGray font-normal">{subTitle}</span>
          </p>
        </div>
        <div
          className="flex items-center cursor-pointer"
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleOpen();
            }
          }}
        >
          <Image
            className={`transform transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
            src={toggleIcon}
            alt="필터 눌러서 열고 닫기"
            width={16}
            height={16}
          />
        </div>
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
          <div className="py-3 px-5 bg-sectionWhite">{children}</div>
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
  text-11 font-semibold min-w-[74px] h-9
  px-3 rounded
  flex items-center justify-center
  transition-all duration-200 ease-in-out
  ${isSelected ? 'bg-mainCoral text-white' : 'bg-white text-brightGray'}
`;

  const contentStyles = `
  flex items-center gap-2
  ${IconComponent ? 'justify-between w-full' : 'justify-center'}
`;

  return (
    <div
      className={baseStyles}
      onClick={() => onClick && onClick(value)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (onClick) {
            onClick(value);
          }
        }
      }}
    >
      <div className={contentStyles}>
        {IconComponent && (
          <div className="flex items-center gap-1">
            {IconComponent && (
              <IconComponent color={isSelected ? '#FFFFFF' : '#BFBFBF'} />
            )}
            <span>{title}</span>
          </div>
        )}
        {!IconComponent && <span>{title}</span>}
        {isSelected && <Image src={CheckedIcon} alt="CheckedIcon" />}
      </div>
    </div>
  );
};

export const Accordion = Object.assign(AccordionItemWrapper, {
  Single: AccordionItemSingleContainer,
  Grid: AccordionItemGridContainer,
  Content: AccordionItemContent,
});
