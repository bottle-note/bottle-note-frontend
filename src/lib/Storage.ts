export class Storage {
  static setItem(key: string, value: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static getItem<T>(key: string): T | null {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);

      if (item) {
        try {
          return JSON.parse(item) as T;
        } catch (error) {
          console.error('Error parsing JSON from localStorage', error);
          return null;
        }
      }
    }

    return null;
  }

  static removeItem(key: string) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}
