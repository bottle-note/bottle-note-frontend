interface Props {
  offName?: string;
  onName?: string;
  offColor?: string;
  onColor?: string;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const Toggle = ({
  onName = '리뷰 공개',
  offName = '리뷰 비공개',
  onColor = 'bg-mainCoral',
  offColor = 'bg-mainGray',
  isActive,
  onToggle,
  disabled = false,
}: Props) => {
  return (
    <div className="flex items-center space-x-1">
      <button
        className={`toggle-container flex items-center w-[1.35rem] h-3 rounded-full ${
          isActive ? onColor : offColor
        }`}
        disabled={disabled}
        onClick={onToggle}
        aria-label={isActive ? onName : offName}
      >
        <div
          className={`toggle-handle w-[0.6rem] h-[0.6rem] rounded-full bg-white transform transition-transform ${
            isActive ? 'translate-x-full' : 'translate-x-0.5'
          }`}
        />
      </button>
      <p className="text-9 text-mainGray">{isActive ? onName : offName}</p>
    </div>
  );
};

export default Toggle;
