interface TotalProps {
  total?: number | null;
  unit?: string;
}

const Total = ({ total, unit = '개' }: TotalProps) => {
  if (total == null) return null;

  return (
    <span className="shrink-0 text-xs text-fg-neutral-muted">{`총 ${total}${unit}`}</span>
  );
};

export default Total;
