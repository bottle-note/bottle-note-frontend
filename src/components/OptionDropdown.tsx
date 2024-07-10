import BackDrop from './BackDrop';

interface Props {
  handleClose: () => void;
  options: { type: string; name: string }[];
  handleOptionSelect: ({ type, name }: { type: string; name: string }) => void;
}

// TODO: 옵션, 타입 props 로 받아오도록 수정
export default function OptionDropdown({
  handleClose,
  options,
  handleOptionSelect,
}: Props) {
  const type = '정렬';

  return (
    <BackDrop isShow>
      <div className="w-full h-full flex flex-col justify-end items-center px-4 gap-3 pb-2">
        <section className="w-full bg-white rounded-xl divide-y max-h-[400px] overflow-y-scroll">
          <article className="py-4 text-center text-mainGray text-sm">
            {type}
          </article>
          {options.map((option) => (
            <article
              key={option.type}
              className="py-4 text-center text-subCoral"
              onClick={() => {
                handleOptionSelect(option);
              }}
            >
              {option.name}
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
