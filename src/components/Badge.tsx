import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Props {
  type: string;
  styleClass?: string;
  icon?: string;
  iconHeight?: number;
  iconWidth?: number;
}

function Badge({ type, icon, iconHeight = 10, iconWidth = 10 }: Props) {
  const [name, setName] = useState('');
  const [textColor, setTextColor] = useState('manGray');
  const [borderColor, setBorderColor] = useState('mainGray');
  const [bgColor, setBgColor] = useState('white');

  useEffect(() => {
    switch (type) {
      case 'WAITING':
        setName('대기중');
        setTextColor('subCoral');
        setBorderColor('subCoral');
        break;
      case 'SUCCESS':
        setName('처리 완료');
        setTextColor('white');
        setBorderColor('subCoral');
        setBgColor('subCoral');
        break;
      case 'REJECT':
        setName('반려');
        setTextColor('mainGray');
        setBorderColor('mainGray');
        break;
      case 'DELETED':
        setName('삭제');
        setTextColor('mainGray');
        setBorderColor('mainGray');
        break;
      default:
        setName('확인중');
        setTextColor('mainGray');
        setBorderColor('mainGray');
        break;
    }
  }, [type]);

  return (
    <div
      className={`border inline-block border-${borderColor} px-2 rounded-md text-10 text-${textColor} bg-${bgColor}`}
    >
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
  );
}

export default Badge;
