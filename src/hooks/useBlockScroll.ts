export const useBlockScroll = () => {
  const handleScroll = ({ isScroll = true }: { isScroll: boolean }) => {
    if (isScroll) {
      // 스크롤 활성화
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
    } else {
      // 스크롤 비활성화
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'contain';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';
    }
  };

  return { handleScroll };
};
