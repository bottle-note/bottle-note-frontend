import { useEffect, useState } from 'react';
import Image from 'next/image';
import ArrowIcon from 'public/icon/arrow-down-subcoral.svg';

interface Props {
  title: string;
  subTitle?: string;
  toggleIcon?: string;
  forceOpen?: boolean;
}

export default function AccrodionHeader({
  title,
  subTitle,
  toggleIcon = ArrowIcon,
  forceOpen,
  children,
}: React.PropsWithChildren<Props>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (forceOpen) setIsOpen(forceOpen);
  }, [forceOpen]);

  return (
    <>
      <div className="px-5 py-3 flex items-center justify-between border-b border-bgGray">
        <div className="flex items-center space-x-1">
          <p className="text-12 text-mainDarkGray font-bold">
            {title}{' '}
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

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`transform transition-all duration-500 ease-out ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
