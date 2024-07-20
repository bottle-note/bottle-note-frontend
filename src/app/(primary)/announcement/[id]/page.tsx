function AccnouncementIdPage() {
  // NOTE: content 데이터는 markdown 형식으로 오는 것이 좋겠음
  const MOCK_DATA = {
    title: '정기 업데이트 알림',
    date: '2024. 04. 01',
    id: 1,
    content: `보틀노트 긴급 서비스 점검에 대하여 안내드립니다.\n서비스 점검으로 인해 익일 22시 부터 서비스가 중단될 예정입니다. 이용에 참고 부탁드리며, 불편을 드려 죄송하지 않습니다.\n보틀노트 드림`,
  };

  return (
    <article>
      <p className="text-9 text-mainGray font-light border-b pb-1">
        {MOCK_DATA.date}
      </p>
      <div className="border-b py-4">
        <h1 className="font-15 font-bold text-mainDarkGray mb-3">
          {MOCK_DATA.title}
        </h1>
        <p className="whitespace-pre-wrap text-xs text-mainDarkGray">
          {MOCK_DATA.content}
        </p>
      </div>
    </article>
  );
}

export default AccnouncementIdPage;
