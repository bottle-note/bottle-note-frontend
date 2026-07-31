'use client';

import { useScrollState } from '@/hooks/useScrollState';
import { useNavigateReviewWrite } from '@/hooks/useNavigateReviewWrite';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';

const FloatingReviewButton = ({ alcoholId }: { alcoholId: string }) => {
  const { isAtTop, isVisible } = useScrollState();
  const { handleReviewWrite } = useNavigateReviewWrite();

  const handleClick = () => {
    handleReviewWrite(alcoholId);
  };

  const getPositionClass = () => {
    const basePosition = isVisible ? 'bottom-[115px]' : 'bottom-[14px]';
    return `${basePosition} right-[max(16px,calc((100vw-468px)/2+16px))]`;
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed z-20 rounded-full bg-bg-brand-solid text-fg-brand-contrast shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl active:bg-bg-brand-solid-pressed ${getPositionClass()}`}
      style={{
        width: isAtTop ? 'auto' : '52px',
        height: '52px',
        paddingLeft: isAtTop ? '16px' : '0px',
        paddingRight: isAtTop ? '16px' : '0px',
      }}
    >
      <div className="flex items-center justify-center h-full">
        <SemanticIcon src="/icon/plus-white.svg" width={17} height={17} />
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: isAtTop ? 'auto' : '0px',
            opacity: isAtTop ? 1 : 0,
            marginLeft: isAtTop ? '12px' : '0px',
          }}
        >
          <p className="text-16 font-bold whitespace-nowrap">리뷰작성</p>
        </div>
      </div>
    </button>
  );
};

export default FloatingReviewButton;
