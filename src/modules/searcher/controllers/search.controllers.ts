import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { BasicCar } from '../../cars-basic/models/basic-cars.models';
import { PremiumCar } from '../../cars-premium/models/premium-cars.models';
import { SpecialCar } from '../../cars-special/models/special-cars.models';
import { User } from '../../users/models/users.models';

export const searchCars = async (
  req: Request<{}, {}, { query: string }>,
  res: Response<
    ResponseDTO<{
      basicCars: BasicCar[];
      premiumCars: PremiumCar[];
      specialCars: SpecialCar[];
    }>
  >
) => {
  try {
    return res.json({
      ok: true,
      data: {
        basicCars: [],
        premiumCars: [],
        specialCars: [],
      },
    });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const searchUsers = async (
  req: Request<{}, {}, { query: string }>,
  res: Response<ResponseDTO<User[]>>
) => {
  try {
    //#region READONLY
    const { query } = req.body;
    const users = await User.findAll({
      where: { username: { [Op.like]: `%${query}%` }, status: 1 },
      limit: 100,
    });
    return res.json({
      ok: true,
      data: users,
    });
    //#endregion READONLY
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};
