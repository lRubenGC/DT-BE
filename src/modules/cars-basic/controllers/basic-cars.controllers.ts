import { Request, Response } from 'express';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import {
  AVAILABLE_USER_PROPERTY_FILTERS,
  USER_PROPERTY,
} from '../../../shared/models/cars.models';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { getBasicCarsFiltersSeries } from '../../available-series/functions/available-series.functions';
import { AvailableSeries } from '../../available-series/models/available-series.models';
import {
  getFilters,
  getUserPropertyCondition,
} from '../../user-filters/functions/user-filters.functions';
import { User } from '../../users/models/users.models';
import { getBasicSeriesFilters } from '../functions/get-basic-series-filters';
import { UserBasicCar } from '../models/basic-cars-relations.models';
import {
  BASIC_CARS_PAGE,
  BASIC_CARS_YEARS_AVAILABLE,
  BASIC_DEFAULT_YEAR,
} from '../models/basic-cars.constants';
import {
  BasicCar,
  BasicCarDTO,
  BasicCarFiltersResponse,
  BasicCarPayload,
  BasicCarResponse,
  BasicCarsGrouped,
} from '../models/basic-cars.models';

export const getBasicCars = async (
  req: Request<{}, {}, BasicCarPayload>,
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
      yearToFilter: number | undefined;
      mainSerieToFilter: string | undefined;
      exclusiveSerieToFilter: string | undefined;
      userPropertyToFilter: USER_PROPERTY | undefined;
    };
    //#endregion FILTERS STORAGED

    //#region FILTERS QUERIES
    const coreFilters: WhereOptions = {
      year: yearToFilter ?? BASIC_DEFAULT_YEAR,
      ...getBasicSeriesFilters(mainSerieToFilter, exclusiveSerieToFilter),
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
    const cars: BasicCar[] = user
      ? await BasicCar.findAll({
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
          order: [['col_serie', 'ASC']],
        })
      : await BasicCar.findAll({ where: coreFilters });
    //#endregion FINAL QUERY

    //#region CARS MAP
    let carsOwned = 0;
    const groupedCars = cars.reduce<BasicCarsGrouped>((acc, item) => {
      const car: BasicCar = item.toJSON();
      if (car.hasCar) carsOwned++;
      const key = car.series.split(',')[0];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({ ...car, series: car.series.split(',') } as BasicCarDTO);
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
  req: Request<{}, {}, { id: number }>,
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
    const car: BasicCar | null = user
      ? await BasicCar.findByPk(id, {
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
      : await BasicCar.findByPk(id);
    //#endregion QUERY

    //#region POST VALIDATIONS
    if (!car) return getError(res, 400, ERROR.CAR_NOT_FOUND);
    //#endregion POST VALIDATIONS

    return res.json({
      ok: true,
      data: { ...car.toJSON(), series: car.toJSON().series.split(',') },
    });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const getBasicCarFilters = async (
  req: Request<{}, {}, { year: number }>,
  res: Response<ResponseDTO<BasicCarFiltersResponse>>
) => {
  return res.json({
    ok: true,
    data: {
      year: BASIC_CARS_YEARS_AVAILABLE,
      ...getBasicCarsFiltersSeries(
        await AvailableSeries.findOne({ where: { main: req.body.year } })
      ),
      userProperty: AVAILABLE_USER_PROPERTY_FILTERS,
    },
  });
};

export const addBasicCar = async (
  req: Request<
    {},
    {},
    {
      carId: number;
      hasCar: boolean | null;
      wantsCar: boolean | null;
    }
  >,
  res: Response<ResponseDTO>
) => {
  try {
    //#region READONLY
    const { carId, hasCar, wantsCar } = req.body;
    const { user } = req.session;
    User.belongsToMany(BasicCar, { through: UserBasicCar });
    BasicCar.belongsToMany(User, { through: UserBasicCar });
    //#endregion READONLY

    //#region VALIDATIONS
    if (!user) return getError(res, 400, ERROR.USER_NOT_LOGGED_IN);
    if ((!hasCar && !wantsCar) || (hasCar && wantsCar)) {
      return getError(res, 400, ERROR.BAD_PAYLOAD);
    }
    const car = await BasicCar.findByPk(carId);
    if (!car) return getError(res, 400, ERROR.CAR_NOT_FOUND);
    //#endregion VALIDATIONS

    //#region UPDATE IF EXISTS
    const userCar = await UserBasicCar.findOne({
      where: { UserId: user.id, BasicCarId: carId },
    });
    if (userCar) {
      if (userCar.hasCar) return getError(res, 400, ERROR.USER_ALREADY_HAS_CAR);
      if (wantsCar) return getError(res, 400, ERROR.USER_ALREADY_HAS_CAR);

      userCar.wantsCar = 0;
      userCar.hasCar = 1;
      userCar.save();
      return res.json({
        ok: true,
        data: null,
      });
    }
    //#endregion UPDATE IF EXISTS

    //#region CREATE
    await UserBasicCar.create({
      UserId: user.id,
      BasicCarId: carId,
      hasCar: hasCar ? 1 : 0,
      wantsCar: wantsCar ? 1 : 0,
    });
    return res.json({
      ok: true,
      data: null,
    });
    //#endregion CREATE
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const deleteBasicCar = async (
  req: Request<{}, {}, { carId: number }>,
  res: Response<ResponseDTO>
) => {
  try {
    //#region READONLY
    const { carId } = req.body;
    const { user } = req.session;
    User.belongsToMany(BasicCar, { through: UserBasicCar });
    BasicCar.belongsToMany(User, { through: UserBasicCar });
    //#endregion READONLY

    //#region VALIDATIONS
    if (!user) return getError(res, 400, ERROR.USER_NOT_LOGGED_IN);
    const userCar = await UserBasicCar.findOne({
      where: { UserId: user.id, BasicCarId: carId },
    });
    if (!userCar) return getError(res, 400, ERROR.CAR_NOT_FOUND);
    //#endregion VALIDATIONS

    //#region DELETION
    userCar.destroy();
    return res.json({
      ok: true,
      data: null,
    });
    //#endregion DELETION
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const getSimilarBasicCars = async (
  req: Request<{}, {}, { model_name: number }>,
  res: Response<ResponseDTO<BasicCar[]>>
) => {
  //#region READONLY
  const { model_name } = req.body;
  const { user } = req.session;
  User.belongsToMany(BasicCar, { through: UserBasicCar });
  BasicCar.belongsToMany(User, { through: UserBasicCar });
  //#endregion READONLY

  //#region FINAL QUERY
  const cars = user
    ? await BasicCar.findAll({
        where: {
          id: {
            [Op.in]: Sequelize.literal(`(
              SELECT id FROM (
                SELECT id FROM basic_cars
                WHERE model_name LIKE '%${model_name}%'
                ORDER BY year DESC
                LIMIT 100
              ) AS limited_cars
            )`),
          },
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
        where: { model_name: { [Op.like]: `%${model_name}%` } },
        limit: 100,
        order: [['year', 'DESC']],
      });
  //#endregion FINAL QUERY

  return res.json({
    ok: true,
    data: cars,
  });
};
