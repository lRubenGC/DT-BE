import { ERROR } from '../models/errors.models';

export const isNumber = async (id: number) => {
  if (!id || typeof id !== 'number') {
    throw new Error(ERROR.BAD_PAYLOAD.toString());
  }
};
