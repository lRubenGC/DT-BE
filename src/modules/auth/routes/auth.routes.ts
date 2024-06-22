import { Router } from 'express';
import { check } from 'express-validator';
import {
  isNotDuplicatedEmail,
  isNotDuplicatedUsername,
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from '../../../shared/middlewares/validate-auth';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import {
  login,
  logout,
  protectedRoute,
  register,
} from '../controllers/auth.controllers';

export const authRouter = Router();
export const AUTH_ROUTE = '/api/auth';

authRouter.post(
  '/login',
  [
    check('email').custom(isValidEmail),
    check('password').custom(isValidPassword),
    validateErrors,
  ],
  login
);

authRouter.post(
  '/register',
  [
    check('username').custom(isValidUsername),
    check('username').custom(isNotDuplicatedUsername),
    check('email').custom(isValidEmail),
    check('email').custom(isNotDuplicatedEmail),
    check('password').custom(isValidPassword),
    validateErrors,
  ],
  register
);

authRouter.post('/logout', [validateErrors], logout);

authRouter.post('/protected', [validateErrors], protectedRoute);
