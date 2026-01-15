// ============================================
// Block API - Request/Response Types
// ============================================

// --------------- Response Types ---------------

export interface BlockedUser {
  userId: string;
  userName: string;
  blockedAt: string;
}

export interface BlockListResponse {
  totalCount: number;
  items: BlockedUser[];
}
