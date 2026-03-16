export interface Data<T> {
  data: T;
  message: string;
  acTk?: string;
  errors?: Record<string, string>;
}
