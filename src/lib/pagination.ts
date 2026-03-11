/**
 * Shared pagination types for data services.
 */
export interface PaginatedParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount?: number;
  hasMore: boolean;
}

export const DEFAULT_PAGE_SIZE = 20;

export function toLimitOffset(params: PaginatedParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const offset = (page - 1) * pageSize;
  return { limit: pageSize, offset, page, pageSize };
}
