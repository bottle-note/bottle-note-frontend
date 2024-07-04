import { ListQueryParams, SORT_ORDER, SORT_TYPE } from '@/types/common';
import { useReducer } from 'react';

const initialState: ListQueryParams = {
  keyword: '',
  category: '',
  sortOrder: SORT_ORDER.DESC,
  sortType: SORT_TYPE.POPULAR,
  regionId: '',
};

type State = typeof initialState;

type Action =
  | { type: 'SET_KEYWORD'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_SORT_ORDER'; payload: SORT_ORDER }
  | { type: 'SET_SORT_TYPE'; payload: SORT_TYPE }
  | { type: 'SET_REGION_ID'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_KEYWORD':
      return { ...state, keyword: action.payload };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.payload };
    case 'SET_SORT_TYPE':
      return { ...state, sortType: action.payload };
    case 'SET_REGION_ID':
      return { ...state, regionId: action.payload || '' };
    default:
      return state;
  }
}

export const useFilter = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setKeyword = (keyword: string) => {
    dispatch({ type: 'SET_KEYWORD', payload: keyword });
  };

  const setCategory = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setSortOrder = (sortOrder: SORT_ORDER) => {
    dispatch({ type: 'SET_SORT_ORDER', payload: sortOrder });
  };

  const setSortType = (sortType: SORT_TYPE) => {
    dispatch({ type: 'SET_SORT_TYPE', payload: sortType });
  };

  const setRegionId = (regionId: number) => {
    dispatch({ type: 'SET_REGION_ID', payload: regionId });
  };

  return {
    state,
    setKeyword,
    setCategory,
    setSortOrder,
    setSortType,
    setRegionId,
  };
};
