'use client';

import Image from 'next/image';
import OptionsIcon from 'public/options-icon.svg';

// TODO:
// 1. props로 데이터를 받아올 것
// 2. handler 를 받아와 솔팅을 적용할 것
// 3. ListItem 과 함께 합성 컴포넌트 형식으로 만들어서 핸들러 전달 가능하도록 수정할 것.

interface Props {
  displayValue: string;
  // handler: () => void;
}

const ListManager = ({ displayValue }: Props) => {
  return (
    <article className="flex justify-between text-mainGray text-sm pb-3.25 border-mainBlack border-b">
      <div>총 52개</div>
      <button
        className="flex items-center gap-1 bg-white text-subCoral border border-subCoral px-2.5 py-1 rounded-md text-xxs"
        onClick={() => alert('하단 bottom sheet 으로 옵션 표시')}
      >
        <span>{displayValue}</span>
        <Image src={OptionsIcon} alt="정렬" />
      </button>
    </article>
  );
};

export default ListManager;
