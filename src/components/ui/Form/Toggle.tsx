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
    <div className="flex items-center space-x-3">
      <button
        className={`toggle-container flex items-center justify-center w-32 h-16 rounded-full ${
          isActive ? 'bg-bg-brand-primary-solid' : 'bg-bg-disabled'
        }`}
        disabled={disabled}
        onClick={onToggle}
        aria-label={isActive ? onName : offName}
      >
        <div
          className={`toggle-handle w-[12.8px] h-[12.8px] rounded-full bg-bg-layer-default transform transition-transform ${
            isActive ? 'translate-x-8' : 'translate-x-[-8px]'
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
