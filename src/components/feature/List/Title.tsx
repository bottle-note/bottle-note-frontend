const Title = ({ title }: { title: string }) => {
  return (
    <span className="text-xs font-bold text-mainGray shrink-0">{`${title} ∙ `}</span>
  );
};

export default Title;
