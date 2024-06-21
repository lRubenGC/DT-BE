import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ERROR, getError } from '../models/errors.models';

export const validateErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  return errors.isEmpty()
    ? next()
    : getError(res, 400, ERROR.BAD_PAYLOAD, errors.array());
};
