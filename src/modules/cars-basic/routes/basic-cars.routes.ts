import { Router } from 'express';
import { check } from 'express-validator';
import { isNumber, isString } from '../../../shared/middlewares/shared-validations';
import { isValidYear } from '../../../shared/middlewares/validate-basic-cars';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import {
  addBasicCar,
  deleteBasicCar,
  getBasicCar,
  getBasicCarFilters,
  getBasicCars,
  getSimilarBasicCars,
} from '../controllers/basic-cars.controllers';

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
basicCarsRouter.post(
  '/get-filters',
  [check('year').custom(isValidYear), validateErrors],
  getBasicCarFilters
);
basicCarsRouter.post(
  '/add-car',
  [check('carId').custom(isNumber), validateErrors],
  addBasicCar
);
basicCarsRouter.post(
  '/delete-car',
  [check('carId').custom(isNumber), validateErrors],
  deleteBasicCar
);
basicCarsRouter.post(
  '/get-similar-cars',
  [check('model_name').custom(isString), validateErrors],
  getSimilarBasicCars
);
