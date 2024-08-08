import { ERROR } from '../models/errors.models';

export const validOrder = async (value: any) => {
  if (value && value !== 'ASC' && value !== 'DESC') {
    throw new Error(ERROR.BAD_PAYLOAD.toString());
  }
};

export const validCarType = async (value: any) => {
  if (value && value !== 'basic' && value !== 'premium' && value !== 'special') {
    throw new Error(ERROR.BAD_PAYLOAD.toString());
  }
};
