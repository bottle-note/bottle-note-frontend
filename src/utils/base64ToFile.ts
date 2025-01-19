export const base64ToFile = (
  base64: string,
  filename: string = 'image.png',
  mimeType: string = 'image/png',
): File => {
  const byteCharacters = atob(base64.split(',')[1]);

  const byteNumbers = new Array(byteCharacters.length).map((_, i) =>
    byteCharacters.charCodeAt(i),
  );

  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: mimeType });

  return new File([blob], filename, { type: mimeType });
};
