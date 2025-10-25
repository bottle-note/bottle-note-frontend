interface Props {
  className?: string;
  children: React.ReactNode;
}

const ListSection = ({ className, children }: Props) => {
  return <section className={className}>{children}</section>;
};

export default ListSection;
