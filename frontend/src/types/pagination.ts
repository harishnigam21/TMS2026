export interface Pagination {
  thisPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  nextCursor: number;
  hasMore: boolean;
}
