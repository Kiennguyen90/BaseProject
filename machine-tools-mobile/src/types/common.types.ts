export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export interface ListResult<T> {
  items: T[];
}

export interface PagedRequest {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
