import React, { useState, cloneElement, isValidElement } from 'react';

interface Props {
  children: React.ReactNode;
  tooltipContent: React.ReactNode;
}

const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

export default function HoverTouchBox({ children, tooltipContent }: Props) {
  const isTouch = isTouchDevice();
  const [isTextVisible, setIsTextVisible] = useState(false);

  const handleMouseEnter = () => {
    if (!isTouch) {
      setIsTextVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setIsTextVisible(false);
    }
  };

  // 모바일 환경
  const handleTouch = () => {
    if (isTouch) {
      setIsTextVisible(!isTextVisible);
    }
  };

  const childrenWithProps = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onClick: handleTouch,
      })
    : children;

  return (
    <div>
      {childrenWithProps}
      {isTextVisible && <>{tooltipContent}</>}
    </div>
  );
}
