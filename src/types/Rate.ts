import { AlcoholAPI } from './Alcohol';

export interface RateAPI extends Omit<AlcoholAPI, 'rating'> {
  totalCount: number;
}

export interface UserRatingApi {
  alcoholId: number;
  rating: number;
  userId: number;
}
