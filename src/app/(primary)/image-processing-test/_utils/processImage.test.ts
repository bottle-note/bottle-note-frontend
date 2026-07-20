import {
  hasExifMarker,
  isHeicFile,
  replaceFileExtension,
} from './processImage';

describe('image processing helpers', () => {
  it('replaces an existing extension with webp', () => {
    expect(replaceFileExtension('my.photo.jpeg', 'webp')).toBe('my.photo.webp');
  });

  it('adds an extension when the file has no extension', () => {
    expect(replaceFileExtension('photo', 'webp')).toBe('photo.webp');
  });

  it('detects HEIC by MIME type', async () => {
    const file = new File(['image'], 'photo.bin', { type: 'image/heic' });

    await expect(isHeicFile(file)).resolves.toBe(true);
  });

  it('detects HEIC by file signature even when the extension is missing', async () => {
    const bytes = new Uint8Array(12);
    bytes.set([0x66, 0x74, 0x79, 0x70], 4);
    bytes.set([0x68, 0x65, 0x69, 0x63], 8);
    const file = new File([bytes], 'photo', {
      type: 'application/octet-stream',
    });

    await expect(isHeicFile(file)).resolves.toBe(true);
  });

  it('does not treat an ordinary image as HEIC', async () => {
    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });

    await expect(isHeicFile(file)).resolves.toBe(false);
  });

  it.each(['Exif', 'EXIF'])('detects an %s metadata marker', async (marker) => {
    const file = new File([`header-${marker}-metadata`], 'photo.jpg', {
      type: 'image/jpeg',
    });

    await expect(hasExifMarker(file)).resolves.toBe(true);
  });
});
