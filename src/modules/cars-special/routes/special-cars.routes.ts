import { Router } from 'express';
import { check } from 'express-validator';
import { isNumber, isString } from '../../../shared/middlewares/shared-validations';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import {
  addSpecialCar,
  deleteSpecialCar,
  getSimilarSpecialCars,
  getSpecialCar,
  getSpecialCarFilters,
  getSpecialCars,
} from '../controllers/special-cars.controllers';

export const specialCarsRouter = Router();
export const SPECIAL_CARS_ROUTE = '/api/special-cars';

specialCarsRouter.post(
  '/get-list',
  [check('mainSerie').custom(isString), validateErrors],
  getSpecialCars
);
specialCarsRouter.post(
  '/get-single',
  [check('id').custom(isNumber), validateErrors],
  getSpecialCar
);
specialCarsRouter.post(
  '/get-filters',
  [check('mainSerie').custom(isString), validateErrors],
  getSpecialCarFilters
);
specialCarsRouter.post(
  '/add-car',
  [check('carId').custom(isNumber), validateErrors],
  addSpecialCar
);
specialCarsRouter.post(
  '/delete-car',
  [check('carId').custom(isNumber), validateErrors],
  deleteSpecialCar
);
specialCarsRouter.post(
  '/get-similar-cars',
  [check('model_name').custom(isString), validateErrors],
  getSimilarSpecialCars
);
