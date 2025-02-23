import React, { FC } from 'react';
import Image from 'next/image';
import CheckedIcon from 'public/icon/check-white.svg';

interface Props {
  title: string;
  value: string;
  IconComponent?: FC<{ color?: string; className?: string; size?: number }>;
  isSelected: boolean;
  onClick?: (name: string) => void;
}

export default function FilterOption({
  title,
  value,
  IconComponent,
  isSelected = false,
  onClick,
}: Props) {
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
}
