// ============================================
// Tasting Tags API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export interface ExtractTagsRequest {
  text: string;
}

// --------------- Response Types ---------------

export type ExtractTagsResponse = string[];
