import { v4 as uuid } from 'uuid';
import SkeletonBase from './SkeletonBase';

export default function TagSkeleton({ itemCount = 6 }: { itemCount?: number }) {
  return (
    <>
      <SkeletonBase width={70} height={18} />
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: itemCount }).map(() => (
          <div key={uuid()} className="overflow-hidden flex-shrink-0">
            <SkeletonBase key={uuid()} width={60} height={25} />
          </div>
        ))}
      </div>
    </>
  );
}
