import singleMalt from 'public/categoryImg/singleMalt.png';
import america from 'public/categoryImg/america.png';
import blended from 'public/categoryImg/blended.png';
import blendedMalt from 'public/categoryImg/blendedMalt.png';
import other from 'public/categoryImg/other.png';
import rye from 'public/categoryImg/rye.png';
import { CategoryImage } from '@/types/Image';

export const CATEGORY_IMAGES: {
  [key: string]: CategoryImage;
} = {
  'Single malt': {
    imgSrc: singleMalt,
    imageSize: { width: 55, height: 130 },
  },
  'Blended malt': {
    imgSrc: blendedMalt,
    imageSize: { width: 63, height: 130 },
  },
  Blended: { imgSrc: blended, imageSize: { width: 49, height: 130 } },
  'America(Bourbon)': {
    imgSrc: america,
    imageSize: { width: 65, height: 130 },
  },
  Rye: { imgSrc: rye, imageSize: { width: 62, height: 130 } },
  Other: { imgSrc: other, imageSize: { width: 55, height: 130 } },
};
