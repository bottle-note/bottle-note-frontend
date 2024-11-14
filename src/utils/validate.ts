export const validate = {
  length: ({
    value,
    min,
    max,
  }: {
    value: string;
    min: number;
    max?: number;
  }) => {
    if (value.length < min) {
      return false;
    }

    if (max && value.length > max) {
      return false;
    }

    return true;
  },

  isKoreanAlphaNumeric: (value: string) => {
    const regex = /[^a-zA-Z가-힣0-9]/;
    const result = regex.test(value);

    return !result;
  },

  hasSpace: (value: string) => {
    return /\s/.test(value);
  },
};
