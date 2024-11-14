import { LinkData } from '@/types/LinkButton';
import { CATEGORY_MENUS } from '@/constants/common';
import { CATEGORY_IMAGES } from '@/constants/categoryImg';

type Category = {
  eng: string;
  kor: string;
  link: string;
};

export function getFilteredCategories() {
  return Object.values(CATEGORY_MENUS).filter(
    (category) => category !== CATEGORY_MENUS.All,
  );
}

export function generateMenu(categories: Category[]): LinkData[] {
  return categories.map((category) => {
    const { imgSrc, imageSize } = CATEGORY_IMAGES[category.eng] || {};
    return {
      engName: category.eng,
      korName: category.kor,
      listType: 'Half',
      linkSrc: `/search?category=${category.link}`,
      imgSrc,
      imageSize,
    };
  });
}
