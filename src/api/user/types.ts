// ============================================
// User API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export interface ChangeNicknameParams {
  nickName: string;
}

export interface ChangeProfileImageParams {
  viewUrl: string | null;
}

export interface DeviceInfoParams {
  deviceToken: string;
  platform: string;
}

// --------------- Response Types ---------------

export interface User {
  userId: number;
  nickName: string;
  imageUrl: string;
}

export interface CurrentUserInfo {
  id: number;
  nickname: string;
  imageUrl: string;
}

export interface UserInfo extends User {
  reviewCount: number;
  ratingCount: number;
  pickCount: number;
  followerCount: number;
  followingCount: number;
  isFollow: boolean;
  isMyPage: boolean;
}

export interface ChangeNicknameResponse {
  message: string;
  userId: number;
  beforeNickname: string;
  changedNickname: string;
}

export interface ChangeProfileImageResponse {
  userId: string;
  profileImageUrl: string | null;
  callback: string;
}

export interface DeviceInfoResponse {
  deviceToken: string;
  platform: string;
  message: string;
}

export interface DeleteAccountResponse {
  codeMessage: string;
  message: string;
  userId: number;
  responseAt: string;
}
