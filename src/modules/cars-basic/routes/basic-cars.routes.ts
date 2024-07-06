import { Router } from 'express';
import { check } from 'express-validator';
import { isNumber } from '../../../shared/middlewares/shared-validations';
import { isValidYear } from '../../../shared/middlewares/validate-basic-cars';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import { getBasicCar, getBasicCars } from '../controllers/basic-cars.controllers';

export const basicCarsRouter = Router();
export const BASIC_CARS_ROUTE = '/api/basic-cars';

basicCarsRouter.post(
  '/get-list',
  [check('year').custom(isValidYear), validateErrors],
  getBasicCars
);
basicCarsRouter.post(
  '/get-single',
  [check('id').custom(isNumber), validateErrors],
  getBasicCar
);
