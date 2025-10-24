export const useBlockScroll = () => {
  const handleScroll = ({ isScroll = true }: { isScroll: boolean }) => {
    if (isScroll) {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'unset';
    } else {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
  };

  return { handleScroll };
};
