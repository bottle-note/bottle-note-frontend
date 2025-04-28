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

export interface RateAPI extends Omit<RateAlcoholAPI, 'rating'> {
  totalCount: number;
}

export interface UserRatingApi {
  alcoholId: number;
  rating: number;
  userId: number;
}
