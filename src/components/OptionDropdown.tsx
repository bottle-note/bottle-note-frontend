import BackDrop from './BackDrop';

interface Props {
  handleClose: () => void;
}

// TODO: 옵션, 타입 props 로 받아오도록 수정
export default function OptionDropdown({ handleClose }: Props) {
  const MOCK_OPTIONS = ['인기도순', '별점순', '찜하기순', '댓글순'];
  const type = '정렬';

  return (
    <BackDrop isShow>
      <div className="w-full h-full flex flex-col justify-end items-center px-4 gap-3 pb-2">
        <section className="w-full bg-white rounded-xl divide-y">
          <article className="py-4 text-center text-mainGray text-sm">
            {type}
          </article>
          {MOCK_OPTIONS.map((option) => (
            <article key={option} className="py-4 text-center text-subCoral">
              {option}
            </article>
          ))}
        </section>
        <button
          className="w-full bg-white rounded-xl py-4"
          onClick={handleClose}
        >
          닫기
        </button>
      </div>
    </BackDrop>
  );
}
