import { WHISKEY_EXPLORE_TAB_ID } from '@/app/(primary)/explore/_constants/exploreTabs';
import { LinkData } from '@/types/LinkButton';
import { CATEGORY_MENUS } from '@/constants/common';
import { CATEGORY_IMAGES } from '@/constants/categoryImg';
import { ROUTES } from '@/constants/routes';

type Category = (typeof CATEGORY_MENUS)[keyof typeof CATEGORY_MENUS];

export function getFilteredCategories() {
  return Object.values(CATEGORY_MENUS).filter(
    (category) => category !== CATEGORY_MENUS.All,
  );
}

export function buildWhiskeyExploreCategoryHref(category?: string) {
  const searchParams = new URLSearchParams({
    tab: WHISKEY_EXPLORE_TAB_ID,
  });

  if (category) {
    searchParams.set('category', category);
  }

  return `${ROUTES.EXPLORE.BASE}?${searchParams.toString()}`;
}

export function generateMenu(categories: Category[]): LinkData[] {
  return categories.map((category) => {
    const { imgSrc, imageSize } = CATEGORY_IMAGES[category.eng] || {};
    return {
      engName: category.eng,
      korName: category.kor,
      listType: 'Half',
      linkSrc: buildWhiskeyExploreCategoryHref(category.link),
      imgSrc,
      imageSize,
    };
  });
}
