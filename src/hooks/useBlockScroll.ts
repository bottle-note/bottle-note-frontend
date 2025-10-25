export const useBlockScroll = () => {
  const handleScroll = ({ isScroll = true }: { isScroll: boolean }) => {
    if (isScroll) {
      // 스크롤 활성화
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    } else {
      // 스크롤 비활성화
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'contain';
    }
  };

  return { handleScroll };
};
