import { mkdir, readdir } from 'node:fs/promises';
import sharp from 'sharp';

// Run with: node scripts/generate-mbti-share-images.mjs
const source = new URL('../public/images/whiskey-mbti/characters/', import.meta.url);
const output = new URL('../public/images/whiskey-mbti/share/', import.meta.url);
await mkdir(output, { recursive: true });

for (const file of await readdir(source)) {
  if (!file.endsWith('.webp')) continue;

  // Match the result portrait: beige background, bottom-centered image, border.
  await sharp(new URL(file, source).pathname)
    .resize(846, 756, {
      fit: 'contain',
      position: 'bottom',
      background: '#ebe6dc',
    })
    .flatten({ background: '#ebe6dc' })
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: '#c9c0b2' })
    .jpeg({ quality: 90 })
    .toFile(new URL(file.replace('.webp', '.jpg'), output).pathname);
}
