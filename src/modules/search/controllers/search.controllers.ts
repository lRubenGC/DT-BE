import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import { CAR_TYPE, USER_PROPERTY } from '../../../shared/models/cars.models';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ORDER } from '../../../shared/models/filters.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { UserBasicCar } from '../../cars-basic/models/basic-cars-relations.models';
import { BasicCar, BasicCarDTO } from '../../cars-basic/models/basic-cars.models';
import { UserPremiumCar } from '../../cars-premium/models/premium-cars-relations.models';
import { PremiumCar, PremiumCarDTO } from '../../cars-premium/models/premium-cars.models';
import { UserSpecialCar } from '../../cars-special/models/special-cars-relations.models';
import { SpecialCar, SpecialCarDTO } from '../../cars-special/models/special-cars.models';
import {
  getFilters,
  getUserPropertyCondition,
} from '../../user-filters/functions/user-filters.functions';
import { User } from '../../users/models/users.models';
import { SEARCH_CARS_PAGE } from '../models/search.constants';
import { SearchCarPayload } from '../models/search.models';

export const searchCars = async (
  req: Request<{}, {}, SearchCarPayload>,
  res: Response<
    ResponseDTO<{
      basicCars: BasicCarDTO[];
      premiumCars: PremiumCarDTO[];
      specialCars: SpecialCarDTO[];
      filters: SearchCarPayload;
      basicCarsShowed: number;
      basicCarsOwned: number;
      premiumCarsShowed: number;
      premiumCarsOwned: number;
      specialCarsShowed: number;
      specialCarsOwned: number;
    }>
  >
) => {
  try {
    //#region READONLY
    BasicCar.belongsToMany(User, { through: UserBasicCar });
    User.belongsToMany(BasicCar, { through: UserBasicCar });
    PremiumCar.belongsToMany(User, { through: UserPremiumCar });
    User.belongsToMany(PremiumCar, { through: UserPremiumCar });
    SpecialCar.belongsToMany(User, { through: UserSpecialCar });
    User.belongsToMany(SpecialCar, { through: UserSpecialCar });
    const { query, carType, order, userProperty } = req.body;
    const { user } = req.session;
    //#endregion READONLY

    //#region FILTERS STORAGED
    const { carTypeToFilter, orderToFilter, userPropertyToFilter } = (await getFilters(
      user,
      SEARCH_CARS_PAGE,
      [carType, order, userProperty],
      ['carType', 'order', 'userProperty']
    )) as {
      carTypeToFilter: CAR_TYPE | undefined;
      orderToFilter: ORDER | undefined;
      userPropertyToFilter: USER_PROPERTY | undefined;
    };
    //#endregion FILTERS STORAGED

    //#region FILTERS QUERIES
    const basicUserPropertyFilter =
      user && userPropertyToFilter
        ? getUserPropertyCondition(userPropertyToFilter, 'UserBasicCar')
        : null;
    const premiumUserPropertyFilter =
      user && userPropertyToFilter
        ? getUserPropertyCondition(userPropertyToFilter, 'UserPremiumCar')
        : null;
    const specialUserPropertyFilter =
      user && userPropertyToFilter
        ? getUserPropertyCondition(userPropertyToFilter, 'UserSpecialCar')
        : null;
    if (
      (basicUserPropertyFilter && basicUserPropertyFilter.error) ||
      (premiumUserPropertyFilter && premiumUserPropertyFilter.error) ||
      (specialUserPropertyFilter && specialUserPropertyFilter.error)
    ) {
      return getError(res, 400, ERROR.BAD_PAYLOAD, ['UserProperty']);
    }
    //#endregion FILTERS QUERIES

    //#region FINAL QUERIES
    const basicCars: BasicCar[] =
      carTypeToFilter === 'basic' || carTypeToFilter === undefined
        ? user
          ? await BasicCar.findAll({
              where: {
                id: {
                  [Op.in]: Sequelize.literal(`(
                    SELECT id FROM (
                      SELECT id FROM basic_cars
                      WHERE model_name LIKE '%${query}%'
                      ORDER BY year ${orderToFilter ?? 'DESC'}
                      LIMIT 100
                    ) AS basic_cars
                  )`),
                },
                ...basicUserPropertyFilter,
              },
              include: [
                {
                  model: User,
                  through: {
                    attributes: ['hasCar', 'wantsCar'],
                    where: { UserId: user.id },
                  },
                  attributes: [],
                },
              ],
              attributes: {
                include: [
                  [Sequelize.col('Users.UserBasicCar.hasCar'), 'hasCar'],
                  [Sequelize.col('Users.UserBasicCar.wantsCar'), 'wantsCar'],
                ],
              },
            })
          : await BasicCar.findAll({
              where: { model_name: { [Op.like]: `%${query}%` } },
              limit: 100,
              order: [['year', orderToFilter ?? 'DESC']],
            })
        : [];
    const premiumCars: PremiumCar[] =
      carTypeToFilter === 'premium' || carTypeToFilter === undefined
        ? user
          ? await PremiumCar.findAll({
              where: {
                id: {
                  [Op.in]: Sequelize.literal(`(
                      SELECT id FROM (
                        SELECT id FROM premium_cars
                        WHERE model_name LIKE '%${query}%'
                        ORDER BY year ${orderToFilter ?? 'DESC'}
                        LIMIT 100
                      ) AS premium_cars
                    )`),
                },
                ...premiumUserPropertyFilter,
              },
              include: [
                {
                  model: User,
                  through: {
                    attributes: ['hasCar', 'wantsCar'],
                    where: { UserId: user.id },
                  },
                  attributes: [],
                },
              ],
              attributes: {
                include: [
                  [Sequelize.col('Users.UserPremiumCar.hasCar'), 'hasCar'],
                  [Sequelize.col('Users.UserPremiumCar.wantsCar'), 'wantsCar'],
                ],
              },
            })
          : await PremiumCar.findAll({
              where: { model_name: { [Op.like]: `%${query}%` } },
              limit: 100,
              order: [['year', orderToFilter ?? 'DESC']],
            })
        : [];
    const specialCars: SpecialCar[] =
      carTypeToFilter === 'special' || carTypeToFilter === undefined
        ? user
          ? await SpecialCar.findAll({
              where: {
                id: {
                  [Op.in]: Sequelize.literal(`(
                        SELECT id FROM (
                          SELECT id FROM special_cars
                          WHERE model_name LIKE '%${query}%'
                          ORDER BY year ${orderToFilter ?? 'DESC'}
                          LIMIT 100
                        ) AS special_cars
                      )`),
                },
                ...specialUserPropertyFilter,
              },
              include: [
                {
                  model: User,
                  through: {
                    attributes: ['hasCar', 'wantsCar'],
                    where: { UserId: user.id },
                  },
                  attributes: [],
                },
              ],
              attributes: {
                include: [
                  [Sequelize.col('Users.UserSpecialCar.hasCar'), 'hasCar'],
                  [Sequelize.col('Users.UserSpecialCar.wantsCar'), 'wantsCar'],
                ],
              },
            })
          : await SpecialCar.findAll({
              where: { model_name: { [Op.like]: `%${query}%` } },
              limit: 100,
              order: [['year', orderToFilter ?? 'DESC']],
            })
        : [];
    //#endregion FINAL QUERIES

    //#region CARS MAP
    let basicCarsOwned = 0;
    const basicCarsDTO: BasicCarDTO[] = basicCars.map(c => {
      const car = c.toJSON();
      if (car.hasCar) basicCarsOwned++;
      return { ...car, series: car.series.split(',') };
    });
    const premiumCarsOwned = premiumCars.filter(car => car.toJSON().hasCar).length;
    const specialCarsOwned = specialCars.filter(car => car.toJSON().hasCar).length;
    //#endregion CARS MAP

    return res.json({
      ok: true,
      data: {
        basicCars: basicCarsDTO,
        premiumCars,
        specialCars,
        filters: {
          query,
          carType: carTypeToFilter,
          order: orderToFilter,
          userProperty: userPropertyToFilter,
        },
        basicCarsShowed: basicCarsDTO.length,
        basicCarsOwned,
        premiumCarsShowed: premiumCars.length,
        premiumCarsOwned,
        specialCarsShowed: specialCars.length,
        specialCarsOwned,
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
