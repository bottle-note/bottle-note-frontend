export const useBlockScroll = () => {
  const preventScroll = (e: TouchEvent) => {
    e.preventDefault();
  };

  const handleScroll = ({ isScroll = true }: { isScroll: boolean }) => {
    if (isScroll) {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'unset';
      document.removeEventListener('touchmove', preventScroll);
    } else {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.addEventListener('touchmove', preventScroll, { passive: false });
    }
  };

  return { handleScroll };
};
