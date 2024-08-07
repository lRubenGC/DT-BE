import { Router } from 'express';
import { check } from 'express-validator';
import { isNumber, isString } from '../../../shared/middlewares/shared-validations';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import {
  addPremiumCar,
  deletePremiumCar,
  getPremiumCar,
  getPremiumCarFilters,
  getPremiumCars,
  getSimilarPremiumCars,
} from '../controllers/premium-cars.controllers';

export const premiumCarsRouter = Router();
export const PREMIUM_CARS_ROUTE = '/api/premium-cars';

premiumCarsRouter.post(
  '/get-list',
  [check('mainSerie').custom(isString), validateErrors],
  getPremiumCars
);
premiumCarsRouter.post(
  '/get-single',
  [check('id').custom(isNumber), validateErrors],
  getPremiumCar
);
premiumCarsRouter.post(
  '/get-filters',
  [check('mainSerie').custom(isString), validateErrors],
  getPremiumCarFilters
);
premiumCarsRouter.post(
  '/add-car',
  [check('carId').custom(isNumber), validateErrors],
  addPremiumCar
);
premiumCarsRouter.post(
  '/delete-car',
  [check('carId').custom(isNumber), validateErrors],
  deletePremiumCar
);
premiumCarsRouter.post(
  '/get-similar-cars',
  [check('model_name').custom(isString), validateErrors],
  getSimilarPremiumCars
);
