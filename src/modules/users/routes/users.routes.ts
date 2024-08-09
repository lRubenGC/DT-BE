import { Router } from 'express';
import { check } from 'express-validator';
import { isString } from '../../../shared/middlewares/shared-validations';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import { validCarType } from '../../../shared/middlewares/validate-filters';
import {
  getUserProfile,
  getUserStats,
  updateUser,
} from '../controllers/users.controllers';

export const usersRouter = Router();
export const USERS_ROUTE = '/api/users';

usersRouter.post('/update', [], updateUser);
usersRouter.post(
  '/get-profile',
  [
    check('username').custom(isString),
    check('carType').custom(validCarType),
    validateErrors,
  ],
  getUserProfile
);
usersRouter.post(
  '/get-stats',
  [check('username').custom(isString), validateErrors],
  getUserStats
);
