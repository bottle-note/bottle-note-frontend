import type { ReadonlyURLSearchParams } from 'next/navigation';
import { CATEGORY_MENUS_LIST } from '@/constants/common';
import type { SearchKeyword } from './SearchBar';

const CATEGORY_LABEL_MAP = Object.fromEntries(
  CATEGORY_MENUS_LIST.filter((category) => category.id).map((category) => [
    String(category.id),
    category.name,
  ]),
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
