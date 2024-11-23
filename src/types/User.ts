export interface User {
  userId: number;
  nickName: string;
  imageUrl: string;
}
export interface UserInfoApi extends User {
  reviewCount: number;
  ratingCount: number;
  pickCount: number;
  followerCount: number;
  followingCount: number;
  isFollow: boolean;
  isMyPage: boolean;
}

export interface ReviewUserInfo extends Omit<User, 'imageUrl'> {
  userProfileImage?: null | string;
}
