import type { ReadonlyURLSearchParams } from 'next/navigation';
import { CATEGORY_MENUS_LIST } from '@/constants/common';
import type { SearchKeyword } from './SearchBar';

const CATEGORY_LABEL_MAP = CATEGORY_MENUS_LIST.reduce<Record<string, string>>(
  (acc, category) => {
    if (category.id) {
      acc[String(category.id)] = category.name;
    }
    return acc;
  },
  {},
);

export const getKeywordLabel = (value: string) => {
  return CATEGORY_LABEL_MAP[value] ?? value;
};

export const buildKeywordsFromParams = (
  params: ReadonlyURLSearchParams,
): SearchKeyword[] => {
  return params.getAll('keywords').map((value) => ({
    label: getKeywordLabel(value),
    value,
  }));
};
