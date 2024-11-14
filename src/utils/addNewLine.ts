export function addNewLine(str: string, num: number = 15) {
  let result = '';
  for (let i = 0; i < str.length; i += num) {
    result += `${str.substring(i, i + num)}\n`;
  }
  return result.trim();
}
