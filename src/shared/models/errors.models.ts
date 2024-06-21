import { Response } from 'express';

export enum ERROR {
  SERVER_ERROR = 1,
  BAD_PAYLOAD = 2,
}

export const ERROR_MESSAGE = {
  [ERROR.SERVER_ERROR]: 'Internal server error',
  [ERROR.BAD_PAYLOAD]: 'Bad payload',
};

export const getError = (
  res: Response,
  status: number,
  error: ERROR,
  params: string[] | null = null,
  errorLog?: unknown
) => {
  if (errorLog) console.error(errorLog);
  return res.status(status).json({
    error,
    msg: `${ERROR_MESSAGE[error]}${params ? ' (' + params + ')' : ''}`,
  });
};
