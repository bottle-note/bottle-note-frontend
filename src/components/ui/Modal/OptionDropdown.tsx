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
    <BackDrop isShow onBackdropClick={handleClose}>
      <div className="content-container absolute bottom-0 left-0 right-0 flex flex-col items-center px-4 gap-3 pb-safe">
        <section className="w-full bg-bg-layer-floating text-fg-neutral rounded-xl divide-y divide-stroke-neutral-subtle max-h-[400px] overflow-y-scroll">
          <article className="py-4 text-center text-fg-neutral-muted text-sm">
            {title}
          </article>
          {options.map((option) => (
            <button
              key={option.type}
              className="block w-full py-4 text-center text-fg-brand active:bg-bg-layer-default-pressed"
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
          className="w-full bg-bg-layer-floating text-fg-neutral rounded-xl py-4 active:bg-bg-layer-default-pressed"
          onClick={handleClose}
        >
          닫기
        </button>
      </div>
    </BackDrop>
  );
}
