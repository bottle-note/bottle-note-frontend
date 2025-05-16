import React from 'react';
import Label from './Label';

interface Props {
  tagList: string[];
  styleClass?: string;
}

function FlavorTag({
  tagList,
  styleClass = 'border-subCoral text-subCoral px-[10px] py-[5px] rounded-md text-12',
}: Props) {
  return (
    <section className="mx-5 py-[20px] border-b border-mainGray/30 space-y-[10px]">
      <div className="text-11 font-bold text-mainDarkGray">FLAVOR TAG</div>
      <div className="flex flex-wrap gap-1">
        {tagList.map((tag) => (
          <div key={tag} className="overflow-hidden flex-shrink-0">
            <Label name={tag} styleClass={styleClass} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default FlavorTag;
