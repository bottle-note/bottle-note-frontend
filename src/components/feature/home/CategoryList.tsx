import { LinkData } from '@/types/LinkButton';
import {
  buildWhiskeyExploreCategoryHref,
  getFilteredCategories,
  generateMenu,
} from '@/utils/categoryUtils';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';

function CategoryList() {
  const categories = getFilteredCategories();
  const menu: LinkData[] = generateMenu(categories);

  return (
    <div className="flex flex-col gap-18">
      <div className="grid grid-cols-2 gap-y-18 gap-x-12">
        {menu.map((data) => (
          <PrimaryLinkButton key={data.engName} data={data} />
        ))}
      </div>
      <PrimaryLinkButton
        data={{
          engName: 'ALL',
          korName: '전체',
          listType: 'Half',
          linkSrc: buildWhiskeyExploreCategoryHref(),
        }}
      />
    </div>
  );
}

export default CategoryList;
