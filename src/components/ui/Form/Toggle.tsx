interface Props {
  offName?: string;
  onName?: string;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
  textSize?: string;
}

const Toggle = ({
  onName = '리뷰 공개',
  offName = '리뷰 비공개',
  isActive,
  onToggle,
  disabled = false,
  textSize = 'text-10',
}: Props) => {
  return (
    <div className="flex items-center space-x-[3px]">
      <button
        className={`toggle-container flex items-center justify-center w-8 h-4 rounded-full ${
          isActive ? 'bg-bg-brand-solid' : 'bg-bg-disabled'
        }`}
        disabled={disabled}
        onClick={onToggle}
        aria-label={isActive ? onName : offName}
      >
        <div
          className={`toggle-handle w-[0.8rem] h-[0.8rem] rounded-full bg-bg-layer-default transform transition-transform ${
            isActive ? 'translate-x-2' : 'translate-x-[-0.5rem]'
          }`}
        />
      </button>
      <p className={`${textSize} text-fg-neutral-muted`}>
        {isActive ? onName : offName}
      </p>
    </div>
  );
};

export default Toggle;
