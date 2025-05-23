/** Универсальная пагинация (meta можно уточнять под API) */
export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    [k: string]: unknown;
  };
}
