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
    <div className="flex items-center space-x-[3px]">
      <button
        className={`toggle-container flex items-center justify-center w-8 h-4 rounded-full ${
          isActive ? onColor : offColor
        }`}
        disabled={disabled}
        onClick={onToggle}
        aria-label={isActive ? onName : offName}
      >
        <div
          className={`toggle-handle w-[0.8rem] h-[0.8rem] rounded-full bg-white transform transition-transform ${
            isActive ? 'translate-x-2' : 'translate-x-[-0.5rem]'
          }`}
        />
      </button>
      <p className="text-10 text-mainGray">{isActive ? onName : offName}</p>
    </div>
  );
};

export default Toggle;
