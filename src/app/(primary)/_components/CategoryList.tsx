import { LinkData } from '@/types/LinkButton';
import { getFilteredCategories, generateMenu } from '@/utils/categoryUtils';
import LinkButton from '@/components/LinkButton';

function CategoryList() {
  const categories = getFilteredCategories();
  const menu: LinkData[] = generateMenu(categories);

  return (
    <div className="space-y-[18px]">
      <div className="grid grid-cols-2 gap-y-[18px] gap-x-[11.7px]">
        {menu.map((data) => (
          <LinkButton key={data.engName} data={data} />
        ))}
      </div>
      <LinkButton
        data={{
          engName: 'ALL',
          korName: '전체',
          linkSrc: '/search?category=',
        }}
      />
    </div>
  );
}

export default CategoryList;
