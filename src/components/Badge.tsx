import React from 'react';
import Image from 'next/image';

interface Props {
  type: string;
  styleClass?: string;
  icon?: string;
  iconHeight?: number;
  iconWidth?: number;
}

function Badge({ type, icon, iconHeight = 10, iconWidth = 10 }: Props) {
  const getBadgeStyles = () => {
    switch (type) {
      case 'WAITING':
        return {
          name: '대기중',
          textColor: 'subCoral',
          borderColor: 'subCoral',
          bgColor: 'white',
        };
      case 'SUCCESS':
        return {
          name: '처리 완료',
          textColor: 'white',
          borderColor: 'subCoral',
          bgColor: 'subCoral',
        };
      case 'REJECT':
        return {
          name: '반려',
          textColor: 'mainGray',
          borderColor: 'mainGray',
          bgColor: 'white',
        };
      case 'DELETED':
        return {
          name: '삭제',
          textColor: 'mainGray',
          borderColor: 'mainGray',
          bgColor: 'white',
        };
      default:
        return {
          name: '확인중',
          textColor: 'mainGray',
          borderColor: 'mainGray',
          bgColor: 'white',
        };
    }
  };

  const { name, textColor, borderColor, bgColor } = getBadgeStyles();

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
