import express from 'express';
import { SessionUser } from './src/shared/models/session.models';

declare global {
  namespace Express {
    interface Request {
      session: {
        user: SessionUser | null;
      };
    }
  }
}
