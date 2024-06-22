import { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
  res.json('login');
};
export const register = async (req: Request, res: Response) => {
  res.json('register');
};
export const logout = async (req: Request, res: Response) => {
  res.json('logout');
};
export const protectedRoute = async (req: Request, res: Response) => {
  res.json('protectedRoute');
};
