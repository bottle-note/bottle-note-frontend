'use client';

import { useRouter } from 'next/navigation';

// TODO: 실제 api dto 에 맞출것
interface Props {
  rates: number;
  reviews: number;
  likes: number;
  id: number;
}

const HistoryOverview = ({ rates, reviews, likes, id }: Props) => {
  const router = useRouter();

  const HISTORY_OVERVIEW = [
    { name: '별점', value: rates, link: `/user/${id}/my-bottle?type=ratings` },
    {
      name: '리뷰',
      value: reviews,
      link: `/user/${id}/my-bottle?type=reviews`,
    },
    { name: '찜하기', value: likes, link: `/user/${id}/my-bottle?type=picks` },
  ];

  return (
    <article className="flex justify-center pt-2.75 divide-x divide-subCoral divide-opacity-30 text-fontBurgundy">
      {HISTORY_OVERVIEW.map((item) => (
        <button onClick={() => router.push(item.link)} key={item.name}>
          <p className="flex flex-col items-center px-8.5" key={item.name}>
            <span className="text-[2.125rem] font-bold text-subCoral">
              {item.value}
            </span>
            <span className="text-sm whitespace-nowrap">{item.name}</span>
          </p>
        </button>
      ))}
    </article>
  );
};
export default HistoryOverview;
