import { ERROR } from '../models/errors.models';

export const validOrder = async (value: any) => {
  if (value && value !== 'ASC' && value !== 'DESC') {
    throw new Error(ERROR.BAD_PAYLOAD.toString());
  }
};
