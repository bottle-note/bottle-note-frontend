const Title = ({ title }: { title: string }) => {
  return (
    <span className="shrink-0 text-xs font-bold text-fg-neutral-muted">{`${title} ∙ `}</span>
  );
};

export default Title;
