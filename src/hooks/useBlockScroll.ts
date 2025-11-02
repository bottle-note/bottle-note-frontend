export const useBlockScroll = () => {
  const handleScroll = ({ isScroll = true }: { isScroll: boolean }) => {
    if (isScroll) {
      // 스크롤 활성화
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
      document.body.style.top = '';

      // 저장된 스크롤 위치로 복원
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    } else {
      // 스크롤 비활성화
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'contain';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';
      document.body.style.top = `-${scrollY}px`;
    }
  };

  return { handleScroll };
};
