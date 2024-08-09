import { Router } from 'express';
import { check } from 'express-validator';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import { getUserProfileCars, updateUser } from '../controllers/users.controllers';
import { validCarType } from '../../../shared/middlewares/validate-filters';

export const usersRouter = Router();
export const USERS_ROUTE = '/api/users';

usersRouter.post('/update', [], updateUser);
usersRouter.post(
  '/get-profile-cars',
  [check('carType').custom(validCarType), validateErrors],
  getUserProfileCars
);
