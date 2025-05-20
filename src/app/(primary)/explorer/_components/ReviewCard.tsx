import Image from 'next/image';

interface ReviewCardProps {
  user: {
    avatarUrl: string;
    nickname: string;
  };
  whiskeyName: string;
  rating: number;
  imageUrl?: string;
  reviewText: string;
  flavorTags: string[];
  likes: number;
  comments: number;
  date: string;
  isBest?: boolean;
  isMyComment?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  user,
  whiskeyName,
  rating,
  imageUrl,
  reviewText,
  flavorTags,
  likes,
  comments,
  date,
  isBest,
  isMyComment,
}) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <div className="flex items-start mb-3">
        <Image
          src={user.avatarUrl}
          alt={user.nickname}
          width={36}
          height={36}
          className="rounded-full mr-3 mt-1"
        />
        <div className="flex-grow">
          <p className="font-semibold text-gray-800 text-base">
            {user.nickname}
          </p>
          <p className="text-sm text-amber-700 cursor-pointer hover:underline">
            {whiskeyName} &gt;
          </p>
        </div>
        <div className="ml-auto flex items-center pt-1">
          <svg
            className="w-5 h-5 text-amber-500 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
          <span className="font-bold text-gray-800 text-lg">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {(isBest || isMyComment) && (
        <div className="flex space-x-2 mb-3 ml-[48px]">
          {' '}
          {/* Align with text block */}
          {isBest && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              👍 베스트
            </span>
          )}
          {isMyComment && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              👤 나의 코멘트
            </span>
          )}
        </div>
      )}

      {imageUrl && (
        <div className="mb-3 rounded-md overflow-hidden relative w-full h-72 sm:h-80 md:h-96">
          <Image
            src={imageUrl}
            alt={whiskeyName}
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}

      <p className="text-gray-700 text-sm mb-3 leading-relaxed break-words">
        {reviewText}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {flavorTags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-amber-50 border border-amber-300 text-amber-700 px-2.5 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center text-gray-500 text-xs">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
          </svg>
          {likes}
        </span>
        <span className="mx-3 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
          </svg>
          {comments}
        </span>
        <span className="ml-auto">{date}</span>
        {/* Optional: More actions icon
        <svg className="w-4 h-4 ml-2 cursor-pointer" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
        */}
      </div>
    </div>
  );
};

export default ReviewCard;
