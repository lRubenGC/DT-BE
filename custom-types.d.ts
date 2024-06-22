import express from 'express';

declare global {
  namespace Express {
    interface Request {
      session: {
        user: {
          id: number;
          email: string;
          username: string;
        } | null;
      };
    }
  }
}
