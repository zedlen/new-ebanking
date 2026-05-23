export interface Pagination {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  total: number;
  data: T[];
}
