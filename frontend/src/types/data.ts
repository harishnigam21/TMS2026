import { Pagination } from "./pagination";

export interface Data<T> {
  data?: T;
  message: string;
  status?: boolean;
  acTk?: string;
  errors?: Record<string, string>;
  pagination?: Pagination;
}
