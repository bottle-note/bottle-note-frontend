import { Storage } from './Storage';

export interface ISearchHistoryService {
  get: () => string[] | [];
  save: (keyword: string) => void;
  removeAll: () => void;
  removeOne: (keyword: string) => void;
}

export class SearchHistoryService implements ISearchHistoryService {
  #storage;
  #key;

  constructor(storage = Storage) {
    this.#storage = storage;
    this.#key = 'searchHistory';
  }

  get() {
    const item = this.#storage.getItem(this.#key);

    if (item) return JSON.parse(item) as string[];

    return [];
  }

  save(keyword: string) {
    let list = this.get();

    list = list.filter((item) => item !== keyword);
    list.unshift(keyword);

    this.#storage.setItem(this.#key, JSON.stringify(list));
  }

  removeAll() {
    this.#storage.removeItem(this.#key);
  }

  removeOne(keyword: string) {
    let list = this.get();
    list = list.filter((item) => item !== keyword);

    this.#storage.setItem(this.#key, JSON.stringify(list));
  }
}
