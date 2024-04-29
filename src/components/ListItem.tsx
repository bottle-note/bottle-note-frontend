import Image from 'next/image';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import LikeBtn from '@/app/(primary)/user/[id]/_components/LikeBtn'; // 위치이동!
import Review from '@/app/(primary)/user/[id]/_components/ReviewBtn';

interface Props {
  data: {
    whisky_id: number;
    kor_name: string;
    eng_name: string;
    rating: number;
    category: string;
    image_path: string;
    // TODO: api dto 논의를 통해 아래 조건들도 옵셔널로 필요
    isLiked?: boolean;
    isReviewed?: boolean;
    review_count?: number;
  };
}

// TODO: Props 적용
const ListItem = ({ data }: Props) => {
  const {
    kor_name,
    eng_name,
    category,
    image_path,
    rating,
    isLiked,
    isReviewed,
    review_count,
  } = data;

  return (
    <article className="flex items-center space-x-4 text-mainBlack border-mainBlack border-b h-[90px]">
      <div className="relative w-[89px] h-[89px]">
        <Image src={image_path} alt="위스키 이미지" fill objectFit="cover" />
      </div>

      <section className="flex-1 space-y-1.">
        <article className="flex justify-between items-center ">
          <h2 className="whitespace-pre text-sm leading-sm font-bold line">
            {kor_name}
          </h2>
          <div className="flex flex-col">
            {/* rating이 null 혹은 0인 경우 invisible */}
            <Star rating={rating} />
            {review_count && (
              <span className="text-[0.625rem] justify-self-end row-start-2 text-right">
                {`${review_count}`}
              </span>
            )}
          </div>
        </article>

        <article className="flex justify-between">
          <p className="text-xxs">
            <span>{truncStr(eng_name, 16)}</span>
            <span> · {category}</span>
          </p>
          <div className="space-x-1.5 flex items-center">
            {isReviewed && <Review />}
            {/* TODO: 유저가 로그인 상태인지 확인하여 조건부 렌더링 */}
            <LikeBtn isLiked={isLiked} />
          </div>
        </article>
      </section>
    </article>
  );
};

export default ListItem;
