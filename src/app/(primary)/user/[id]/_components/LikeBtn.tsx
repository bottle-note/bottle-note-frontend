import Image from 'next/image';

interface Props {
  isLiked?: boolean;
}

// TODO: Props 적용
const LikeBtn = ({ isLiked }: Props) => {
  return (
    <button className="justify-self-end row-start-3">
      {isLiked ? (
        <Image src="/like-outline.svg" width={14} height={14} alt="좋아요" />
      ) : (
        <Image src="/like-filled.svg" width={14} height={14} alt="좋아요" />
      )}
    </button>
  );
};

export default LikeBtn;
