import { Response } from 'express';

export interface ResponseDTO<T = null> {
  ok: boolean;
  data: T;
}

export const getResponse = <T>(res: Response, data: T): Response<ResponseDTO<T>> => {
  return res.json({
    ok: true,
    data,
  });
};
