const Total = ({ total, unit = '개' }: { total: number; unit?: string }) => {
  return (
    <span className="shrink-0 text-xs text-fg-neutral-muted">{`총 ${total}${unit}`}</span>
  );
};

export default Total;
