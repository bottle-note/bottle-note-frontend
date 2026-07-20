import imageCompression from 'browser-image-compression';

export const IMAGE_PROCESSING_OPTIONS = {
  maxWidthOrHeight: 1080,
  quality: 0.8,
  outputType: 'image/webp',
} as const;

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1']);

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessedImage {
  file: File;
  sourceDimensions: ImageDimensions;
  resultDimensions: ImageDimensions;
  sourceWasHeic: boolean;
  sourceHasExifMarker: boolean | null;
  resultHasExifMarker: boolean;
  durationMs: number;
}

interface ProcessImageOptions {
  onProgress?: (progress: number, message: string) => void;
  useWebWorker?: boolean;
}

function getExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] ?? '';
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(reader.error ?? new Error('파일을 읽지 못했습니다.'));
    reader.readAsArrayBuffer(blob);
  });
}

export function replaceFileExtension(fileName: string, extension: string) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExtension || 'image'}.${extension}`;
}

export async function isHeicFile(file: File) {
  const mimeType = file.type.toLowerCase();
  const extension = getExtension(file.name);

  if (
    mimeType === 'image/heic' ||
    mimeType === 'image/heif' ||
    extension === 'heic' ||
    extension === 'heif'
  ) {
    return true;
  }

  if (file.size < 12) return false;

  const header = await readBlobAsArrayBuffer(file.slice(8, 12));
  const brand = String.fromCharCode(...new Uint8Array(header))
    .replace('\0', ' ')
    .trim();

  return HEIC_BRANDS.has(brand);
}

export async function hasExifMarker(file: Blob) {
  const bytes = new Uint8Array(await readBlobAsArrayBuffer(file));
  const exifMarkers = [
    [0x45, 0x58, 0x49, 0x46], // WebP EXIF chunk
    [0x45, 0x78, 0x69, 0x66], // JPEG Exif header
  ];

  for (let index = 0; index <= bytes.length - 4; index += 1) {
    if (
      exifMarkers.some((marker) =>
        marker.every((byte, offset) => bytes[index + offset] === byte),
      )
    ) {
      return true;
    }
  }

  return false;
}

export function getImageDimensions(file: Blob): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('브라우저가 이미지 크기를 읽지 못했습니다.'));
    };
    image.src = url;
  });
}

export async function processImage(
  sourceFile: File,
  { onProgress, useWebWorker = true }: ProcessImageOptions = {},
): Promise<ProcessedImage> {
  const startedAt = performance.now();
  const sourceWasHeic = await isHeicFile(sourceFile);
  const sourceHasExifMarker = sourceWasHeic
    ? null
    : await hasExifMarker(sourceFile);
  let processableFile = sourceFile;

  onProgress?.(5, '파일 형식을 확인했습니다.');

  if (sourceWasHeic) {
    onProgress?.(10, 'HEIC 디코더를 불러오는 중입니다.');
    const { heicTo } = await import('heic-to');

    onProgress?.(15, 'HEIC 이미지를 디코딩하는 중입니다.');
    const decodedBlob = await heicTo({
      blob: sourceFile,
      type: 'image/png',
    });
    processableFile = new File(
      [decodedBlob],
      replaceFileExtension(sourceFile.name, 'png'),
      {
        type: 'image/png',
        lastModified: sourceFile.lastModified,
      },
    );
  }

  const sourceDimensions = await getImageDimensions(processableFile);
  onProgress?.(20, 'WebP 이미지로 변환하는 중입니다.');

  const compressedFile = await imageCompression(processableFile, {
    maxWidthOrHeight: IMAGE_PROCESSING_OPTIONS.maxWidthOrHeight,
    initialQuality: IMAGE_PROCESSING_OPTIONS.quality,
    fileType: IMAGE_PROCESSING_OPTIONS.outputType,
    preserveExif: false,
    useWebWorker,
    onProgress: (progress) => {
      onProgress?.(
        20 + Math.round(progress * 0.75),
        '크기와 화질을 최적화하는 중입니다.',
      );
    },
  });

  if (compressedFile.type !== IMAGE_PROCESSING_OPTIONS.outputType) {
    throw new Error(
      `이 브라우저에서 WebP 인코딩에 실패했습니다. 결과 형식: ${compressedFile.type || '알 수 없음'}`,
    );
  }

  const resultFile = new File(
    [compressedFile],
    replaceFileExtension(sourceFile.name, 'webp'),
    {
      type: IMAGE_PROCESSING_OPTIONS.outputType,
      lastModified: sourceFile.lastModified,
    },
  );
  const resultDimensions = await getImageDimensions(resultFile);
  const resultHasExifMarker = await hasExifMarker(resultFile);

  onProgress?.(100, '전처리가 완료되었습니다.');

  return {
    file: resultFile,
    sourceDimensions,
    resultDimensions,
    sourceWasHeic,
    sourceHasExifMarker,
    resultHasExifMarker,
    durationMs: performance.now() - startedAt,
  };
}
