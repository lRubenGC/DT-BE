import { Router } from 'express';
import { getBasicCar, getBasicCars } from '../controllers/basic-cars.controllers';
import { validateErrors } from '../../../shared/middlewares/validate-errors';

export const basicCarsRouter = Router();
export const BASIC_CARS_ROUTE = '/api/basic-cars';

basicCarsRouter.post('/get-list', [validateErrors], getBasicCars);
basicCarsRouter.post('/get-single', [validateErrors], getBasicCar);
