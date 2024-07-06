import { ERROR } from '../models/errors.models';

export const isValidId = async (id: number) => {
  if (!id || typeof id !== 'number') {
    throw new Error(ERROR.BAD_PAYLOAD.toString());
  }
};
