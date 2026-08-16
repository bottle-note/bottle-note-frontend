export interface RateAlcoholAPI {
  alcoholId: number;
  korName: string;
  engName: string;
  ratingCount: number;
  engCategoryName: string;
  korCategoryName: string;
  imageUrl: string;
  isPicked: boolean;
}

export type RateAPI = Omit<RateAlcoholAPI, 'rating'>;

export interface UserRatingApi {
  alcoholId: number;
  rating: number;
  userId: number;
}
