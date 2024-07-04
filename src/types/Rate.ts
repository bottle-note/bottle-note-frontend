import { AlcoholAPI } from './Alcohol';

export interface RateAPI extends Omit<AlcoholAPI, 'rating'> {
  totalCount: number;
}
