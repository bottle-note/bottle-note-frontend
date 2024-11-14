const Total = ({ total }: { total: number }) => {
  return (
    <span className="text-xs text-mainGray shrink-0">{`총 ${total}개`}</span>
  );
};

export default Total;
