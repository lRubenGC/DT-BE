import { Request, Response } from 'express';
import { Sequelize, WhereOptions } from 'sequelize';
import { USER_PROPERTY } from '../../../shared/models/cars.models';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import {
  getFilters,
  getUserPropertyCondition,
} from '../../user-filters/functions/user-filters.functions';
import { User } from '../../users/models/users.models';
import { getSeriesFilters } from '../functions/get-series-filters';
import { UserBasicCar } from '../models/basic-cars-relations.models';
import { BASIC_CARS_PAGE, BASIC_DEFAULT_YEAR } from '../models/basic-cars.constants';
import {
  BasicCar,
  BasicCarDTO,
  BasicCarPayload,
  BasicCarResponse,
  BasicCarsGrouped,
} from '../models/basic-cars.models';

export const getBasicCars = async (
  req: Request<{}, ResponseDTO<BasicCarResponse>, BasicCarPayload>,
  res: Response<ResponseDTO<BasicCarResponse>>
) => {
  try {
    //#region READONLY
    BasicCar.belongsToMany(User, { through: UserBasicCar });
    User.belongsToMany(BasicCar, { through: UserBasicCar });
    const { year, mainSerie, exclusiveSerie, userProperty } = req.body;
    const { user } = req.session;
    //#endregion READONLY

    //#region FILTERS STORAGED
    const {
      yearToFilter,
      mainSerieToFilter,
      exclusiveSerieToFilter,
      userPropertyToFilter,
    } = (await getFilters(
      user,
      BASIC_CARS_PAGE,
      [year, mainSerie, exclusiveSerie, userProperty],
      ['year', 'mainSerie', 'exclusiveSerie', 'userProperty']
    )) as {
      yearToFilter: number | null;
      mainSerieToFilter: string | null;
      exclusiveSerieToFilter: string | null;
      userPropertyToFilter: USER_PROPERTY | null;
    };
    //#endregion FILTERS STORAGED

    //#region FILTERS QUERIES
    const coreFilters: WhereOptions = {
      year: yearToFilter ?? BASIC_DEFAULT_YEAR,
      ...getSeriesFilters(mainSerieToFilter, exclusiveSerieToFilter),
    };
    const userPropertyFilter =
      user && userPropertyToFilter
        ? getUserPropertyCondition(userPropertyToFilter, 'UserBasicCar')
        : null;
    if (userPropertyFilter && userPropertyFilter.error) {
      return getError(res, 400, ERROR.BAD_PAYLOAD, ['UserProperty']);
    }
    //#endregion FILTERS QUERIES

    //#region FINAL QUERY
    let cars: BasicCar[];
    if (user) {
      cars = await BasicCar.findAll({
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
            [Sequelize.col('Users.UserBasicCar.hasCar'), 'hasCar'],
            [Sequelize.col('Users.UserBasicCar.wantsCar'), 'wantsCar'],
          ],
        },
      });
    } else {
      cars = await BasicCar.findAll({ where: coreFilters });
    }
    //#endregion FINAL QUERY

    //#region CARS MAP
    let carsOwned = 0;
    const groupedCars = cars.reduce<BasicCarsGrouped>((acc, item) => {
      const car = item.toJSON();
      if (car.hasCar) carsOwned++;
      const key = car.series.split(',')[0];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({ ...car, series: car.series.split(',') });
      return acc;
    }, {});
    //#endregion CARS MAP

    return res.json({
      ok: true,
      data: {
        cars: groupedCars,
        filters: {
          year: yearToFilter ?? BASIC_DEFAULT_YEAR,
          mainSerie: mainSerieToFilter,
          exclusiveSerie: exclusiveSerieToFilter,
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

export const getBasicCar = async (
  req: Request<{}, ResponseDTO<BasicCarDTO>, { id: number }>,
  res: Response<ResponseDTO<BasicCarDTO>>
) => {
  try {
    //#region READONLY
    BasicCar.belongsToMany(User, { through: UserBasicCar });
    User.belongsToMany(BasicCar, { through: UserBasicCar });
    const { id } = req.body;
    const { user } = req.session;
    //#endregion READONLY

    //#region QUERY
    let car: BasicCar | null;
    if (user) {
      car = await BasicCar.findByPk(id, {
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
      });
    } else {
      car = await BasicCar.findByPk(id);
    }
    //#endregion QUERY

    //#region POST VALIDATIONS
    if (!car) return getError(res, 400, ERROR.CAR_NOT_FOUND);
    car = car.toJSON()!;
    //#endregion POST VALIDATIONS

    //#region CAR MAP
    const carDTO = { ...car, series: car.series.split(',') };
    //#endregion CAR MAP

    return res.json({
      ok: true,
      data: { ...carDTO },
    });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};
