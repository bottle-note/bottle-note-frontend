export interface User {
  userId: number;
  nickName: string;
  imageUrl: string;
}

export interface CurrentUserInfoApi {
  id: number;
  nickname: string;
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

export interface RelationInfo {
  userId: number;
  followUserId: number;
  followUserNickname: string;
  userProfileImage: string;
  status: 'UNFOLLOW' | 'FOLLOWING';
  reviewCount: number;
  ratingCount: number;
}
