import React, { useState } from 'react';

interface Props {
  defaultState?: boolean;
  offValue?: string;
  onValue?: string;
}

const Toggle = ({
  defaultState = false,
  offValue = '리뷰 비공개',
  onValue = '리뷰 공개',
}: Props) => {
  const [isToggled, setIsToggled] = useState<boolean>(defaultState);

  const handleClick = () => {
    setIsToggled((prev) => !prev);
  };

  return (
    <div className="flex items-center space-x-1">
      <div
        className={`toggle-container flex items-center w-[1.35rem] h-3 rounded-full ${
          isToggled ? 'bg-mainCoral' : 'bg-mainGray'
        }`}
        onClick={handleClick}
      >
        <div
          className={`toggle-handle w-[0.6rem] h-[0.6rem] rounded-full bg-white transform transition-transform ${
            isToggled ? 'translate-x-full' : 'translate-x-0.5'
          }`}
        ></div>
      </div>
      <p>{isToggled ? onValue : offValue}</p>
    </div>
  );
};

export default Toggle;