import React from 'react';

interface Props {
  subTitle: string;
}

function CategoryTitle({ subTitle }: Props) {
  return (
    <div className="border-b-[0.09rem] border-subCoral">
      <div className="w-40 bg-bgGray text-center rounded-tl-lg rounded-tr-lg py-[0.38rem]">
        <p className="text-15 font-semibold text-subCoral">{subTitle}</p>
      </div>
    </div>
  );
}

export default CategoryTitle;
