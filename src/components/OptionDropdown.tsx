import BackDrop from './BackDrop';

interface Props {
  handleClose: () => void;
  options: { type: string; name: string }[];
  handleOptionSelect: ({ type, name }: { type: string; name: string }) => void;
  title?: string;
}

export default function OptionDropdown({
  handleClose,
  options,
  handleOptionSelect,
  title = '정렬',
}: Props) {
  return (
    <BackDrop isShow>
      <div className="w-full h-full flex flex-col justify-end items-center px-4 gap-3 pb-2">
        <section className="w-full bg-white rounded-xl divide-y max-h-[400px] overflow-y-scroll">
          <article className="py-4 text-center text-mainGray text-sm">
            {title}
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
