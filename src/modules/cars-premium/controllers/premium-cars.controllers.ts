import { Request, Response } from 'express';
import { Sequelize, WhereOptions } from 'sequelize';
import {
  AVAILABLE_USER_PROPERTY_FILTERS,
  USER_PROPERTY,
} from '../../../shared/models/cars.models';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { getPremiumCarsFiltersSeries } from '../../available-series/functions/available-series.functions';
import { AvailableSeries } from '../../available-series/models/available-series.models';
import {
  getFilters,
  getUserPropertyCondition,
} from '../../user-filters/functions/user-filters.functions';
import { User } from '../../users/models/users.models';
import { getPremiumSeriesFilters } from '../functions/get-premium-series-filters';
import { UserPremiumCar } from '../models/premium-cars-relations.models';
import {
  PREMIUM_CARS_PAGE,
  PREMIUM_DEFAULT_MAIN_SERIE,
  PREMIUM_MAIN_SERIES_AVAILABLE,
} from '../models/premium-cars.constants';
import {
  PremiumCar,
  PremiumCarDTO,
  PremiumCarFiltersResponse,
  PremiumCarPayload,
  PremiumCarResponse,
  PremiumCarsGrouped,
} from '../models/premium-cars.models';

export const getPremiumCars = async (
  req: Request<{}, ResponseDTO<PremiumCarResponse>, PremiumCarPayload>,
  res: Response<ResponseDTO<PremiumCarResponse>>
) => {
  try {
    //#region READONLY
    PremiumCar.belongsToMany(User, { through: UserPremiumCar });
    User.belongsToMany(PremiumCar, { through: UserPremiumCar });
    const { mainSerie, secondarySerie, userProperty } = req.body;
    const { user } = req.session;
    //#endregion READONLY

    //#region FILTERS STORAGED
    const { mainSerieToFilter, secondarySerieToFilter, userPropertyToFilter } =
      (await getFilters(
        user,
        PREMIUM_CARS_PAGE,
        [mainSerie, secondarySerie, userProperty],
        ['mainSerie', 'secondarySerie', 'userProperty']
      )) as {
        mainSerieToFilter: string | null;
        secondarySerieToFilter: string | null;
        userPropertyToFilter: USER_PROPERTY | null;
      };
    //#endregion FILTERS STORAGED

    //#region FILTERS QUERIES
    const coreFilters: WhereOptions = {
      main_serie: mainSerieToFilter ?? PREMIUM_DEFAULT_MAIN_SERIE,
      ...getPremiumSeriesFilters(secondarySerieToFilter),
    };
    const userPropertyFilter =
      user && userPropertyToFilter
        ? getUserPropertyCondition(userPropertyToFilter, 'UserPremiumCar')
        : null;
    if (userPropertyFilter && userPropertyFilter.error) {
      return getError(res, 400, ERROR.BAD_PAYLOAD, ['UserProperty']);
    }
    //#endregion FILTERS QUERIES

    //#region FINAL QUERY
    const cars: PremiumCar[] = user
      ? await PremiumCar.findAll({
          where: { ...coreFilters, ...userPropertyFilter },
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
          order: [['col_serie', 'ASC']],
        })
      : await PremiumCar.findAll({ where: coreFilters });
    //#endregion FINAL QUERY

    //#region CARS MAP
    let carsOwned = 0;
    const groupedCars = cars.reduce<PremiumCarsGrouped>((acc, item) => {
      const car: PremiumCar = item.toJSON();
      if (car.hasCar) carsOwned++;
      if (!acc[car.secondary_serie]) {
        acc[car.secondary_serie] = [];
      }
      acc[car.secondary_serie].push(car);
      return acc;
    }, {});
    //#endregion CARS MAP

    return res.json({
      ok: true,
      data: {
        cars: groupedCars,
        filters: {
          mainSerie: mainSerieToFilter ?? PREMIUM_DEFAULT_MAIN_SERIE,
          secondarySerie: secondarySerieToFilter,
          userProperty: user ? userPropertyToFilter : null,
        },
        carsShowed: cars.length,
        carsOwned,
      },
    });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const getPremiumCar = async (
  req: Request<{}, ResponseDTO<PremiumCarDTO>, { id: number }>,
  res: Response<ResponseDTO<PremiumCarDTO>>
) => {
  try {
    //#region READONLY
    PremiumCar.belongsToMany(User, { through: UserPremiumCar });
    User.belongsToMany(PremiumCar, { through: UserPremiumCar });
    const { id } = req.body;
    const { user } = req.session;
    //#endregion READONLY

    //#region QUERY
    const car: PremiumCar | null = user
      ? await PremiumCar.findByPk(id, {
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
      : await PremiumCar.findByPk(id);
    //#endregion QUERY

    //#region POST VALIDATIONS
    if (!car) return getError(res, 400, ERROR.CAR_NOT_FOUND);
    //#endregion POST VALIDATIONS

    return res.json({
      ok: true,
      data: car,
    });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const getPremiumCarFilters = async (
  req: Request<{}, ResponseDTO<PremiumCarFiltersResponse>, { mainSerie: string }>,
  res: Response<ResponseDTO<PremiumCarFiltersResponse>>
) => {
  return res.json({
    ok: true,
    data: {
      mainSerie: PREMIUM_MAIN_SERIES_AVAILABLE,
      ...getPremiumCarsFiltersSeries(
        await AvailableSeries.findOne({ where: { main: req.body.mainSerie } })
      ),
      userProperty: AVAILABLE_USER_PROPERTY_FILTERS,
    },
  });
};
