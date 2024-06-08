import { Storage } from './Storage';

export interface ITokenService {
  get: () => string | null;
  save: (token: string) => void;
  remove: () => void;
}

export class TokenService implements ITokenService {
  #storage;
  #key;

  constructor(key: string, storage = Storage) {
    this.#storage = storage;
    this.#key = key;
  }

  get() {
    return this.#storage.getItem(this.#key);
  }

  save(token: string) {
    this.#storage.setItem(this.#key, token);
  }

  remove() {
    this.#storage.removeItem(this.#key);
  }
}

export const accessTokenService = new TokenService('accessToken');
