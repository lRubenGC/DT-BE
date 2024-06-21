import { Router } from 'express';
import { getBasicCars } from '../controllers/basic-cars.controllers';

export const basicCarsRouter = Router();
export const BASIC_CARS_ROUTE = '/api/basic-cars';

basicCarsRouter.post('/', [], getBasicCars);
