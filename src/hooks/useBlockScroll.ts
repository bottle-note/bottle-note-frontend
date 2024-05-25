export const useBlockScroll = () => {
  const handleScroll = ({ isScroll = true }: { isScroll: boolean }) => {
    document.body.style.overflow = isScroll ? 'unset' : 'hidden';
  };

  return { handleScroll };
};
