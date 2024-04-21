// TODO: 실제 api dto 에 맞출것
interface Props {
  rates: number;
  reviews: number;
  likes: number;
}

const HistoryOverview = ({ rates, reviews, likes }: Props) => {
  const MOCK_HISTORY_OVERVIEW = [
    { name: '별점', value: rates },
    { name: '리뷰', value: reviews },
    { name: '찜하기', value: likes },
  ];

  return (
    <article className="flex justify-center pt-2.75 divide-x divide-subCoral divide-opacity-30 text-fontBurgundy">
      {MOCK_HISTORY_OVERVIEW.map((item) => (
        <p className="flex flex-col items-center px-8.5" key={item.name}>
          <span className="text-[2.125rem] font-bold text-subCoral">
            {item.value}
          </span>
          <span className="text-sm whitespace-nowrap">{item.name}</span>
        </p>
      ))}
    </article>
  );
};
export default HistoryOverview;
