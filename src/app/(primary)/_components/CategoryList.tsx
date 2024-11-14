import { LinkData } from '@/types/LinkButton';
import { getFilteredCategories, generateMenu } from '@/utils/categoryUtils';
import LinkButton from '@/components/LinkButton';

function CategoryList() {
  const categories = getFilteredCategories();
  const menu: LinkData[] = generateMenu(categories);

  return (
    <div className="space-y-3">
      <LinkButton
        data={{
          engName: 'ALL',
          korName: '전체',
          linkSrc: '/search?category=',
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        {menu.map((data) => (
          <LinkButton key={data.engName} data={data} />
        ))}
      </div>
    </div>
  );
}

export default CategoryList;
