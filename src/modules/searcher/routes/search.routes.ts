import { Router } from 'express';
import { check } from 'express-validator';
import { isString } from '../../../shared/middlewares/shared-validations';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import { validOrder } from '../../../shared/middlewares/validate-filters';
import { searchCars, searchUsers } from '../controllers/search.controllers';

export const searchRouter = Router();
export const SEARCH_ROUTE = '/api/search';

searchRouter.post(
  '/get-cars',
  [check('query').custom(isString), check('order').custom(validOrder), validateErrors],
  searchCars
);
searchRouter.post(
  '/get-users',
  [check('query').custom(isString), validateErrors],
  searchUsers
);
