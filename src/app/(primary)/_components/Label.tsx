import React from 'react';
import Image from 'next/image';

interface Props {
  name: string;
  styleClass?: string;
  icon?: string | React.ReactNode;
  iconHeight?: number;
  iconWidth?: number;
  position?: 'before' | 'after';
}

function Label({
  name,
  icon,
  iconHeight = 10,
  iconWidth = 10,
  styleClass = 'border-white px-2.5 py-1 rounded-md text-10',
  position = 'before',
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

  return (
    <div className={`border inline-block ${styleClass}`}>
      <div className="flex items-center">
        {position === 'before' && icon && (
          <span className="mr-1">{renderIcon()}</span>
        )}
        {name}
        {position === 'after' && icon && (
          <span className="ml-1">{renderIcon()}</span>
        )}
      </div>
    </div>
  );
}

export default Label;
