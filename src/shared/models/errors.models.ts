import { Response } from 'express';
import { ValidationError } from 'express-validator';

export enum ERROR {
  SERVER_ERROR = 1,
  BAD_PAYLOAD = 2,
  USERNAME_EXISTS = 3,
  USERNAME_BAD_PATTERN = 4,
  EMAIL_EXISTS = 5,
  EMAIL_BAD_PATTERN = 6,
  PASSWORD_BAD_PATTERN = 7,
}

export const ERROR_MESSAGE = {
  [ERROR.SERVER_ERROR]: 'Internal server error',
  [ERROR.BAD_PAYLOAD]: 'Bad payload',
  [ERROR.USERNAME_EXISTS]: 'Username exists',
  [ERROR.USERNAME_BAD_PATTERN]: 'Not a valid username pattern',
  [ERROR.EMAIL_EXISTS]: 'Email exists',
  [ERROR.EMAIL_BAD_PATTERN]: 'Not a valid email pattern',
  [ERROR.PASSWORD_BAD_PATTERN]: 'Not a valid password pattern',
};

export const getError = (
  res: Response,
  status: number,
  error: ERROR,
  params: any[] | null = null,
  errorLog?: unknown
) => {
  if (errorLog) console.error(errorLog);
  return res.status(status).json({
    ok: false,
    errors: [
      {
        error,
        msg: `${ERROR_MESSAGE[error]}${params ? ' (' + params + ')' : ''}`,
      },
    ],
  });
};

export const getMiddlewareErrors = (
  res: Response,
  errors: ValidationError[]
) => {
  return res.status(400).json({
    ok: false,
    errors: errors.map(({ msg }) => ({
      error: Number(msg),
      msg: ERROR_MESSAGE[Number(msg) as ERROR],
    })),
  });
};
