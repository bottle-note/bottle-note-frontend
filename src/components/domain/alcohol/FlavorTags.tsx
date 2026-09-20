import React from 'react';
import Label from '@/components/ui/Display/Label';

interface Props {
  tagList: string[];
  styleClass?: string;
  /** 이 섹션 바로 다음에 같은 톤의 섹션이 더 있을 때만 true로 넘긴다. */
  showBottomBorder?: boolean;
}

function FlavorTags({
  tagList,
  styleClass = 'label-default px-[10px] py-[5px] rounded-md text-12',
  showBottomBorder = true,
}: Props) {
  return (
    <section
      className={`mx-5 space-y-[10px] py-[20px] ${
        showBottomBorder ? 'border-b border-stroke-neutral-subtle' : ''
      }`}
    >
      <div className="text-11 font-bold text-fg-neutral">FLAVOR TAG</div>
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

export default FlavorTags;
