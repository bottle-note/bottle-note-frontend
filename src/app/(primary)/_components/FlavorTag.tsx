import React from 'react';
import Label from './Label';

interface Props {
  tagList: string[];
}

function FlavorTag({ tagList }: Props) {
  return (
    <section className="mx-5 py-5 border-b border-mainGray/30 space-y-1">
      <div className="text-13 text-mainDarkGray">FLAVOR TAG</div>
      <div className="flex flex-wrap gap-1">
        {tagList.map((tag) => (
          <div key={tag} className="overflow-hidden flex-shrink-0">
            <Label
              name={tag}
              styleClass="border-subCoral text-subCoral px-2 py-0.5 rounded-md text-10"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default FlavorTag;
