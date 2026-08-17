import React from 'react';
import Image from 'next/image';

interface Props {
  name: string;
  styleClass?: string;
  icon?: string | React.ReactNode;
  iconHeight?: number;
  iconWidth?: number;
  position?: 'before' | 'after';
  iconClass?: string;
  onClick?: () => void;
  isSelected?: boolean;
  selectedStyle?: string;
  unselectedStyle?: string;
  baseStyle?: string;
}

function Label({
  name,
  icon,
  iconHeight = 10,
  iconWidth = 10,
  styleClass = 'border-white px-2.5 py-1 rounded-md text-10',
  position = 'before',
  iconClass = '',
  onClick,
  isSelected = false,
  selectedStyle,
  unselectedStyle,
  baseStyle,
}: Props) {
  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === 'string') {
      return (
        <Image src={icon} width={iconWidth} height={iconHeight} alt={name} />
      );
    }
    return icon;
  };

  const getButtonStyles = () => {
    if (selectedStyle && unselectedStyle) {
      return isSelected ? selectedStyle : unselectedStyle;
    }
    return '';
  };

  const getClassNames = () => {
    const buttonStyles = getButtonStyles();
    const resolvedBaseStyle =
      baseStyle ??
      (onClick
        ? 'inline-flex items-center cursor-pointer transition-colors'
        : 'inline-flex items-center');

    if (buttonStyles) {
      return `${resolvedBaseStyle} ${buttonStyles}`;
    }

    return `border border-solid ${resolvedBaseStyle} ${styleClass}`;
  };

  const content = (
    <>
      {position === 'before' && icon && (
        <span className={`mr-1 ${iconClass}`}>{renderIcon()}</span>
      )}
      {name}
      {position === 'after' && icon && (
        <span className={`ml-1 ${iconClass}`}>{renderIcon()}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={getClassNames()}>
        {content}
      </button>
    );
  }

  return <span className={getClassNames()}>{content}</span>;
}

export default Label;
