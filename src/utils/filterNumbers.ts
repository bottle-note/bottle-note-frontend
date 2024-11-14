export const filterNumbers = (value: string) => {
  const regex = /[^0-9]/g;
  return value.replace(regex, '');
};
