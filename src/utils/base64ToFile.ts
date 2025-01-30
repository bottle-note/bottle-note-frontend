import { v4 as uuidv4 } from 'uuid';

export const base64ToFile = (
  base64: string,
  filename: string = `${uuidv4()}image.png`,
  mimeType: string = 'image/png',
): File => {
  const byteCharacters = atob(base64.split(',')[1]);
  console.log('byteCharacters', byteCharacters);

  const byteNumbers = new Array(byteCharacters.length).map((_, i) =>
    byteCharacters.charCodeAt(i),
  );
  console.log('byteNumbers', byteNumbers);

  const byteArray = new Uint8Array(byteNumbers);
  console.log('byteArray', byteArray);

  return new File([byteArray], filename, { type: mimeType });
};
