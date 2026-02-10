import BackDrop from '@/components/ui/Modal/BackDrop';

interface Props {
  handleClose: () => void;
  options: { type: string; name: string }[];
  handleOptionSelect: (args: any) => void;
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
      <div className="content-container h-full flex flex-col justify-end items-center px-4 gap-3 pb-safe">
        <section className="w-full bg-white rounded-xl divide-y max-h-[400px] overflow-y-scroll">
          <article className="py-4 text-center text-mainGray text-sm">
            {title}
          </article>
          {options.map((option) => (
            <button
              key={option.type}
              className="block w-full py-4 text-center text-subCoral"
              onClick={() => {
                handleOptionSelect(option);
                handleClose();
              }}
            >
              {option.name}
            </button>
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
