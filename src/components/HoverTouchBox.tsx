import React, { cloneElement, isValidElement } from 'react';
import useTooltipStore from '@/store/tooltipStore';

interface Props {
  children: React.ReactNode;
  tooltipContent: React.ReactNode;
  id: string;
}

const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

export default function HoverTouchBox({ children, tooltipContent, id }: Props) {
  const isTouch = isTouchDevice();
  const { activeTooltip, setActiveTooltip } = useTooltipStore();
  const isTextVisible = activeTooltip === id;

  const handleMouseEnter = () => {
    if (!isTouch) {
      setActiveTooltip(id);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setActiveTooltip(null);
    }
  };

  const handleTouch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTouch) {
      setActiveTooltip(isTextVisible ? null : id);
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
      {isTextVisible && (
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
            }
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}
