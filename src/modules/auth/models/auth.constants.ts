import { CookieOptions } from 'express';

export const ACCESS_TOKEN = 'access_token';
export const ACCESS_TOKEN_EXPIRATION = '30m';
export const REFRESH_TOKEN = 'refresh_token';
export const REFRESH_TOKEN_EXPIRATION = '90d';
export const JWT_COOKIE_PROPS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};
