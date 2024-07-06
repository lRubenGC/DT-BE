import { ERROR } from '../models/errors.models';

export const isValidYear = async (year: number) => {
  if (!year || typeof year !== 'number' || year < 1950 || year > 2050) {
    throw new Error(ERROR.BAD_PAYLOAD.toString());
  }
};
