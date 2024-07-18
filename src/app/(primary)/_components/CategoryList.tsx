import { LinkData } from '@/types/LinkButton';
import { CATEGORY_MENUS } from '@/constants/common';
import LinkButton from '@/components/LinkButton';
import whiskeyImg from 'public/category_whisky1.png';

function CategoryList() {
  const categories = Object.values(CATEGORY_MENUS).filter(
    (category) => category !== CATEGORY_MENUS.All,
  );

  const menu: LinkData[] = categories.map((category) => {
    return {
      engName: category.eng,
      korName: category.kor,
      listType: 'Half',
      linkSrc: `/search?category=${category.link}`,
      imgSrc: whiskeyImg,
    };
  });

  return (
    <div className="space-y-3">
      <LinkButton
        data={{
          engName: 'ALL',
          korName: '전체',
          linkSrc: '/search?category=&query=',
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
