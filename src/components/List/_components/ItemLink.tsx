import Link from 'next/link';

export const ItemLink = ({
  alcoholId,
  children,
  className,
}: {
  alcoholId: number;
  children: React.ReactNode;
  className?: string;
}) => (
  <Link
    href={`/search/all/${alcoholId}`}
    className={className ?? `flex justify-start items-center h-full`}
  >
    {children}
  </Link>
);
