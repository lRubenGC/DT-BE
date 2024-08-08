import { Request, Response } from 'express';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import {
  AVAILABLE_USER_PROPERTY_FILTERS,
  USER_PROPERTY,
} from '../../../shared/models/cars.models';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { getSpecialCarsFiltersSeries } from '../../available-series/functions/available-series.functions';
import { AvailableSeries } from '../../available-series/models/available-series.models';
import {
  getFilters,
  getUserPropertyCondition,
} from '../../user-filters/functions/user-filters.functions';
import { User } from '../../users/models/users.models';
import { getSpecialSeriesFilters } from '../functions/get-special-series-filters';
import { UserSpecialCar } from '../models/special-cars-relations.models';
import {
  SPECIAL_CARS_PAGE,
  SPECIAL_DEFAULT_MAIN_SERIE,
  SPECIAL_MAIN_SERIES_AVAILABLE,
} from '../models/special-cars.constants';
import {
  SpecialCar,
  SpecialCarDTO,
  SpecialCarFiltersResponse,
  SpecialCarPayload,
  SpecialCarResponse,
  SpecialCarsGrouped,
} from '../models/special-cars.models';

export const getSpecialCars = async (
  req: Request<{}, {}, SpecialCarPayload>,
  res: Response<ResponseDTO<SpecialCarResponse>>
) => {
  try {
    //#region READONLY
    SpecialCar.belongsToMany(User, { through: UserSpecialCar });
    User.belongsToMany(SpecialCar, { through: UserSpecialCar });
    const { mainSerie, secondarySerie, userProperty } = req.body;
    const { user } = req.session;
    //#endregion READONLY

    //#region FILTERS STORAGED
    const { mainSerieToFilter, secondarySerieToFilter, userPropertyToFilter } =
      (await getFilters(
        user,
        SPECIAL_CARS_PAGE,
        [mainSerie, secondarySerie, userProperty],
        ['mainSerie', 'secondarySerie', 'userProperty']
      )) as {
        mainSerieToFilter: string | undefined;
        secondarySerieToFilter: string | undefined;
        userPropertyToFilter: USER_PROPERTY | undefined;
      };
    //#endregion FILTERS STORAGED

    //#region FILTERS QUERIES
    const coreFilters: WhereOptions = {
      main_serie: mainSerieToFilter ?? SPECIAL_DEFAULT_MAIN_SERIE,
      ...getSpecialSeriesFilters(secondarySerieToFilter),
    };
    const userPropertyFilter =
      user && userPropertyToFilter
        ? getUserPropertyCondition(userPropertyToFilter, 'UserSpecialCar')
        : null;
    if (userPropertyFilter && userPropertyFilter.error) {
      return getError(res, 400, ERROR.BAD_PAYLOAD, ['UserProperty']);
    }
    //#endregion FILTERS QUERIES

    //#region FINAL QUERY
    const cars: SpecialCar[] = user
      ? await SpecialCar.findAll({
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
              [Sequelize.col('Users.UserSpecialCar.hasCar'), 'hasCar'],
              [Sequelize.col('Users.UserSpecialCar.wantsCar'), 'wantsCar'],
            ],
          },
          order: [['col_serie', 'ASC']],
        })
      : await SpecialCar.findAll({ where: coreFilters });
    //#endregion FINAL QUERY

    //#region CARS MAP
    let carsOwned = 0;
    const groupedCars = cars.reduce<SpecialCarsGrouped>((acc, item) => {
      const car: SpecialCar = item.toJSON();
      if (car.hasCar) carsOwned++;
      if (!acc[car.secondary_serie]) {
        acc[car.secondary_serie] = [];
      }
      acc[car.secondary_serie].push(car as SpecialCarDTO);
      return acc;
    }, {});
    //#endregion CARS MAP

    return res.json({
      ok: true,
      data: {
        cars: groupedCars,
        filters: {
          mainSerie: mainSerieToFilter ?? SPECIAL_DEFAULT_MAIN_SERIE,
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

export const getSpecialCar = async (
  req: Request<{}, {}, { id: number }>,
  res: Response<ResponseDTO<SpecialCarDTO>>
) => {
  try {
    //#region READONLY
    SpecialCar.belongsToMany(User, { through: UserSpecialCar });
    User.belongsToMany(SpecialCar, { through: UserSpecialCar });
    const { id } = req.body;
    const { user } = req.session;
    //#endregion READONLY

    //#region QUERY
    const car: SpecialCar | null = user
      ? await SpecialCar.findByPk(id, {
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
      : await SpecialCar.findByPk(id);
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

export const getSpecialCarFilters = async (
  req: Request<{}, {}, { mainSerie: string }>,
  res: Response<ResponseDTO<SpecialCarFiltersResponse>>
) => {
  return res.json({
    ok: true,
    data: {
      mainSerie: SPECIAL_MAIN_SERIES_AVAILABLE,
      ...getSpecialCarsFiltersSeries(
        await AvailableSeries.findOne({ where: { main: req.body.mainSerie } })
      ),
      userProperty: AVAILABLE_USER_PROPERTY_FILTERS,
    },
  });
};

export const addSpecialCar = async (
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
    User.belongsToMany(SpecialCar, { through: UserSpecialCar });
    SpecialCar.belongsToMany(User, { through: UserSpecialCar });
    //#endregion READONLY

    //#region VALIDATIONS
    if (!user) return getError(res, 400, ERROR.USER_NOT_LOGGED_IN);
    if ((!hasCar && !wantsCar) || (hasCar && wantsCar)) {
      return getError(res, 400, ERROR.BAD_PAYLOAD);
    }
    const car = await SpecialCar.findByPk(carId);
    if (!car) return getError(res, 400, ERROR.CAR_NOT_FOUND);
    //#endregion VALIDATIONS

    //#region UPDATE IF EXISTS
    const userCar = await UserSpecialCar.findOne({
      where: { UserId: user.id, SpecialCarId: carId },
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
    await UserSpecialCar.create({
      UserId: user.id,
      SpecialCarId: carId,
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

export const deleteSpecialCar = async (
  req: Request<{}, {}, { carId: number }>,
  res: Response<ResponseDTO>
) => {
  try {
    //#region READONLY
    const { carId } = req.body;
    const { user } = req.session;
    User.belongsToMany(SpecialCar, { through: UserSpecialCar });
    SpecialCar.belongsToMany(User, { through: UserSpecialCar });
    //#endregion READONLY

    //#region VALIDATIONS
    if (!user) return getError(res, 400, ERROR.USER_NOT_LOGGED_IN);
    const userCar = await UserSpecialCar.findOne({
      where: { UserId: user.id, SpecialCarId: carId },
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

export const getSimilarSpecialCars = async (
  req: Request<{}, {}, { model_name: number }>,
  res: Response<ResponseDTO<SpecialCar[]>>
) => {
  //#region READONLY
  const { model_name } = req.body;
  const { user } = req.session;
  User.belongsToMany(SpecialCar, { through: UserSpecialCar });
  SpecialCar.belongsToMany(User, { through: UserSpecialCar });
  //#endregion READONLY

  //#region FINAL QUERY
  const cars = user
    ? await SpecialCar.findAll({
        where: {
          id: {
            [Op.in]: Sequelize.literal(`(
              SELECT id FROM (
                SELECT id FROM special_cars
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
            [Sequelize.col('Users.UserSpecialCar.hasCar'), 'hasCar'],
            [Sequelize.col('Users.UserSpecialCar.wantsCar'), 'wantsCar'],
          ],
        },
      })
    : await SpecialCar.findAll({
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
