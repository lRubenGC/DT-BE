import { Response } from 'express';
import { ValidationError } from 'express-validator';

export enum ERROR {
  SERVER_ERROR = 1,
  BAD_PAYLOAD = 2,
  USERNAME_DUPLICATED = 3,
  USERNAME_BAD_PATTERN = 4,
  EMAIL_DUPLICATED = 5,
  EMAIL_BAD_PATTERN = 6,
  PASSWORD_BAD_PATTERN = 7,
  BAD_LOGIN = 8,
  CAR_NOT_FOUND = 9,
  USER_NOT_LOGGED_IN = 10,
  USER_ALREADY_HAS_CAR = 11,
  USER_NOT_FOUND = 12,
  FORM_UNCHANGED = 13,
}

export const ERROR_MESSAGE: { [key in ERROR]: string } = {
  [ERROR.SERVER_ERROR]: 'Internal server error',
  [ERROR.BAD_PAYLOAD]: 'Bad payload',
  [ERROR.USERNAME_DUPLICATED]: 'Duplicated username',
  [ERROR.USERNAME_BAD_PATTERN]: 'Not a valid username pattern',
  [ERROR.EMAIL_DUPLICATED]: 'Duplicated email',
  [ERROR.EMAIL_BAD_PATTERN]: 'Not a valid email pattern',
  [ERROR.PASSWORD_BAD_PATTERN]: 'Not a valid password pattern',
  [ERROR.BAD_LOGIN]: 'Not valid credentials',
  [ERROR.CAR_NOT_FOUND]: 'Car not found',
  [ERROR.USER_NOT_LOGGED_IN]: 'User not logged in',
  [ERROR.USER_ALREADY_HAS_CAR]: 'Car has already been added to user',
  [ERROR.USER_NOT_FOUND]: 'User not found',
  [ERROR.FORM_UNCHANGED]: 'There are no changes in form',
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

export const getMiddlewareErrors = (res: Response, errors: ValidationError[]) => {
  return res.status(400).json({
    ok: false,
    errors: errors.map(({ msg }) => ({
      error: Number(msg),
      msg: ERROR_MESSAGE[Number(msg) as ERROR],
    })),
  });
};
