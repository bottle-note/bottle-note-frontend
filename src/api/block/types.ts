// ============================================
// Block API - Request/Response Types
// ============================================

import type { InfiniteListParams } from '@/api/_shared/types';

export type BlockListParams = InfiniteListParams;

export interface BlockedUser {
  userId: string;
  userName: string;
  blockedAt: string;
}

export interface BlockListResponse {
  items: BlockedUser[];
}
