export interface IResponse<T = null> {
  ok: boolean;
  data: T;
}
