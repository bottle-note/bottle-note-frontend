import React, { useState } from 'react';
import Image from 'next/image';
import ToggleDarkGrayIcon from 'public/icon/arrow-down-darkgray.svg';

interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: React.ReactNode;
}

interface SingleOptionProps {
  children: React.ReactNode;
}

interface GridOptionsProps {
  cols?: number;
  children: React.ReactNode;
}

function SingleOption({ children }: SingleOptionProps) {
  return <div className="mb-1">{children}</div>;
}

function GridOptions({ cols = 2, children }: GridOptionsProps) {
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
}

export default function AccordionItem({
  title,
  defaultOpen = false,
  onToggle,
  children,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <article>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between py-3 px-5 bg-white border-b border-brightGray"
        onClick={handleToggle}
      >
        <h3 className="text-left font-medium">{title}</h3>
        <Image
          src={ToggleDarkGrayIcon}
          alt="toggle"
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && <div className="py-3 px-5 bg-sectionWhite">{children}</div>}
    </article>
  );
}

AccordionItem.SingleOption = SingleOption;
AccordionItem.GridOptions = GridOptions;
