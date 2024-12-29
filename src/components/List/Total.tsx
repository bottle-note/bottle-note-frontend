const Total = ({ total, unit = '개' }: { total: number; unit?: string }) => {
  return (
    <span className="text-xs text-mainGray shrink-0">{`총 ${total}${unit}`}</span>
  );
};

export default Total;
