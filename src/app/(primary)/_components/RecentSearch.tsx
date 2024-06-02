import Image from 'next/image';
import DeleteIcon from 'public/icon/close-subcoral.svg';

// TODO: 로컬스토리지와 연계하여 데이터 보여줄 것
export default function RecentSearch() {
  return (
    <section className=" bg-white w-full h-full z-100">
      <h2 className="text-sm font-bold text-subCoral">최근 검색어</h2>
      <section className="border-t border-b border-subCoral divide-y divide-subCoral text-xs my-3">
        {['글렌드로냑 12Y', '조니워커', '짐빔', '브레드 앤 버터'].map(
          (text) => (
            <article
              className="flex justify-between items-center py-3 text-subCoral"
              key={text}
            >
              <span>{text}</span>
              <button>
                <Image src={DeleteIcon} alt="delete" />
              </button>
            </article>
          ),
        )}
      </section>
      <button className="text-xxs text-mainGray">전체기록삭제</button>
    </section>
  );
}
