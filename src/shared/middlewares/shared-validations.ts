import { ERROR } from '../models/errors.models';

export const isNumber = async (value: any) => {
  if (!value || typeof value !== 'number') {
    throw new Error(ERROR.BAD_PAYLOAD.toString());
  }
};

export const isString = async (value: any) => {
  if (!value || typeof value !== 'string') {
    throw new Error(ERROR.BAD_PAYLOAD.toString());
  }
};
