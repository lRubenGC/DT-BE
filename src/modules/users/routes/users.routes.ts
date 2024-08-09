import { Router } from 'express';
import { check } from 'express-validator';
import { isString } from '../../../shared/middlewares/shared-validations';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import { validCarType } from '../../../shared/middlewares/validate-filters';
import {
  getUserProfileCars,
  getUserProfileStats,
  updateUser,
} from '../controllers/users.controllers';

export const usersRouter = Router();
export const USERS_ROUTE = '/api/users';

usersRouter.post('/update', [], updateUser);
usersRouter.post(
  '/get-profile-cars',
  [
    check('username').custom(isString),
    check('carType').custom(validCarType),
    validateErrors,
  ],
  getUserProfileCars
);
usersRouter.post(
  '/get-profile-stats',
  [check('username').custom(isString), validateErrors],
  getUserProfileStats
);
