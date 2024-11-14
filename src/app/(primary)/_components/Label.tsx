import React from 'react';
import Image from 'next/image';

interface Props {
  name: string;
  styleClass?: string;
  icon?: string;
  iconHeight?: number;
  iconWidth?: number;
}

function Label({
  name,
  icon,
  iconHeight = 10,
  iconWidth = 10,
  styleClass = 'border-white px-2.5 py-1 rounded-md text-10',
}: Props) {
  return (
    <div>
      <div className={`border inline-block ${styleClass}`}>
        <div className="flex items-center">
          {icon && (
            <Image
              className="mr-1"
              src={icon}
              width={iconWidth}
              height={iconHeight}
              alt={name}
            />
          )}
          {name}
        </div>
      </div>
    </div>
  );
}

export default Label;
