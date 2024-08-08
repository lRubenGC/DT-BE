import { Router } from 'express';
import { check } from 'express-validator';
import { isString } from '../../../shared/middlewares/shared-validations';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import { updateUser } from '../controllers/users.controllers';

export const usersRouter = Router();
export const USERS_ROUTE = '/api/users';

usersRouter.post('/update', [], updateUser);
