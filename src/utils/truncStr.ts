export const truncStr = (str: string, maxLen: number) => {
  if (str.length < maxLen) return str;

  return `${str.substring(0, maxLen)}..`;
};
