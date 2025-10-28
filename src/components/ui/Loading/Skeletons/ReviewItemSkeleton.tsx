import SkeletonBase from './SkeletonBase';

function ReviewItemSkeleton() {
  return (
    <div className="border-b border-mainGray/30 py-1 w-full space-y-0">
      {/* 상단 유저/닉네임/라벨/별점 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1">
          <SkeletonBase width={22} height={22} borderRadius="50%" />
          <SkeletonBase width={60} height={18} />
          <SkeletonBase width={45} height={18} />
          <SkeletonBase width={45} height={18} />
        </div>
        <SkeletonBase width={50} height={25} />
      </div>
      {/* 가격/사이즈 */}
      <SkeletonBase width={100} height={15} />
      {/* 리뷰 내용/이미지 */}
      <div className="grid grid-cols-5 mt-1">
        <div className="col-span-4">
          <SkeletonBase width={400} height={60} className="mb-1" />
        </div>
        <div className="flex justify-end items-center">
          <SkeletonBase width={60} height={60} />
        </div>
      </div>
      {/* 하단 버튼 */}
      <div className="flex justify-between text-11 text-mainGray my-1">
        <div className="flex space-x-3">
          <SkeletonBase width={32} height={16} />
          <SkeletonBase width={32} height={16} />
          <SkeletonBase width={70} height={18} />
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonBase width={60} height={16} />
          <SkeletonBase width={5} height={16} />
        </div>
      </div>
    </div>
  );
}

export default ReviewItemSkeleton;
