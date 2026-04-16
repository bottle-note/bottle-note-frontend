interface SkeletonListProps {
  count: number;
  gap?: number;
  children: React.ReactNode;
  className?: string;
}

export default function SkeletonList({
  count,
  gap = 8,
  children,
  className = '',
}: SkeletonListProps) {
  return (
    <div className={`flex flex-col ${className}`} style={{ gap: `${gap}px` }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{children}</div>
      ))}
    </div>
  );
}
