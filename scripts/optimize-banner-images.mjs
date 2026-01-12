import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANNER_DIR = path.join(__dirname, '../public/bannerImg');
const TARGET_WIDTH = 750;
const QUALITY = 80;

async function optimizeImages() {
  const files = fs.readdirSync(BANNER_DIR);

  for (const file of files) {
    const filePath = path.join(BANNER_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) continue;

    const originalSize = fs.statSync(filePath).size;
    const baseName = path.basename(file, ext);
    const outputPath = path.join(BANNER_DIR, `${baseName}.webp`);

    try {
      const metadata = await sharp(filePath).metadata();
      const { width: originalWidth, height: originalHeight } = metadata;
      const needsResize = originalWidth > TARGET_WIDTH;

      let pipeline = sharp(filePath);

      if (needsResize) {
        pipeline = pipeline.resize(TARGET_WIDTH, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }

      await pipeline.webp({ quality: QUALITY }).toFile(outputPath + '.tmp');

      const newSize = fs.statSync(outputPath + '.tmp').size;

      if (ext !== '.webp' || newSize < originalSize) {
        if (ext !== '.webp') {
          fs.unlinkSync(filePath);
        }
        fs.renameSync(outputPath + '.tmp', outputPath);
        const resizeInfo = needsResize ? ` (${originalWidth}x${originalHeight} → ${TARGET_WIDTH}px)` : '';
        console.log(`✅ ${file}: ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${((1 - newSize / originalSize) * 100).toFixed(1)}% 감소)${resizeInfo}`);
      } else {
        fs.unlinkSync(outputPath + '.tmp');
        console.log(`⏭️ ${file}: 이미 최적화됨 (${originalWidth}x${originalHeight})`);
      }
    } catch (error) {
      console.error(`❌ ${file}: ${error.message}`);
    }
  }
}

optimizeImages().then(() => {
  console.log('\n배너 이미지 최적화 완료!');
});
