import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getMiddlewareErrors } from '../models/errors.models';

export const validateErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  return errors.isEmpty() ? next() : getMiddlewareErrors(res, errors.array());
};
