import React from 'react';

interface Props {
  name: string;
}

function MenuList({ name }: Props) {
  return (
    <div className="border-b-[1.4px] border-subCoral">
      <div className="w-[165px] text-center bg-bgGray rounded-tl-md rounded-tr-md py-[6px]">
        <p className="text-15 font-extrabold text-subCoral whitespace-nowrap">
          {name}
        </p>
      </div>
    </div>
  );
}

export default MenuList;
