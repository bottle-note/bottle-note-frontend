const MOCK_HISTORY_OVERVIEW = [
  { name: '별점', value: 53 },
  { name: '리뷰', value: 12 },
  { name: '찜하기', value: 6 },
];

// FIXME: name 이 api 응답으로 오는 값에 따라 동적으로 변하도록 수정 필요
const HistoryOverview = () => {
  return (
    <article className="flex justify-center pt-2.75 divide-x divide-subCoral divide-opacity-30 text-fontBurgundy">
      {MOCK_HISTORY_OVERVIEW.map((item) => (
        <p className="flex flex-col items-center px-8.5" key={item.name}>
          <span className="text-[2.125rem] font-bold text-[#DF762A]">
            {item.value}
          </span>
          <span className="text-sm whitespace-nowrap">{item.name}</span>
        </p>
      ))}
    </article>
  );
};
export default HistoryOverview;
