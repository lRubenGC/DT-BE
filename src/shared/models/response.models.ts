export interface ResponseDTO<T = null> {
  ok: boolean;
  data: T;
}
