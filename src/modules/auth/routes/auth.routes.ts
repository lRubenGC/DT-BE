import { Router } from 'express';
import { validateErrors } from '../../../shared/middlewares/validate-errors';
import {
  login,
  logout,
  protectedRoute,
  register,
} from '../controllers/auth.controllers';
import { check } from 'express-validator';
import {
  isValidEmail,
  isValidUsername,
  isValidPassword,
} from '../../../shared/middlewares/validate-auth';

export const authRouter = Router();
export const AUTH_ROUTE = '/api/auth';

authRouter.post('/login', [validateErrors], login);
authRouter.post(
  '/register',
  [
    check('username').custom(isValidUsername),
    check('email').custom(isValidEmail),
    check('password').custom(isValidPassword),
    validateErrors,
  ],
  register
);
authRouter.post('/logout', [validateErrors], logout);
authRouter.post('/protected', [validateErrors], protectedRoute);
