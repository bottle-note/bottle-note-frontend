import type { AlcoholAPI } from '@/types/Alcohol';
import type { HomeFeaturedConfigKey } from '@/constants/home';

// HOME_FEATURED_CONFIG의 키 타입을 재사용하여 일관성 유지
export type HomeFeaturedType = HomeFeaturedConfigKey;

export type HomeFeaturedAlcoholItem = AlcoholAPI & { path: string };
