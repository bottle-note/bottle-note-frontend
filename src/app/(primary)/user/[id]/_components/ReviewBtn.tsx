import Image from 'next/image';

const Review = () => {
  return (
    <button className="justify-self-end row-start-3">
      <Image src="/review.svg" width={14} height={14} alt="좋아요" />
    </button>
  );
};

export default Review;
