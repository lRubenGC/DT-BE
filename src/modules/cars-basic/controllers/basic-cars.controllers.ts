import { Request, Response } from 'express';
import { Sequelize, WhereOptions } from 'sequelize';
import { USER_PROPERTY } from '../../../shared/models/cars.models';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { getFilter } from '../../user-filters/functions/user-filters.functions';
import { User } from '../../users/models/users.models';
import { getSeriesFilters } from '../functions/filters';
import { UserBasicCar } from '../models/basic-cars-relations.models';
import {
  BASIC_CARS_PAGE,
  BASIC_DEFAULT_YEAR,
} from '../models/basic-cars.constants';
import {
  BasicCar,
  BasicCarPayload,
  BasicCarResponse,
} from '../models/basic-cars.models';

export const getBasicCars = async (
  req: Request<{}, ResponseDTO<BasicCarResponse>, BasicCarPayload>,
  res: Response<ResponseDTO<BasicCarResponse>>
) => {
  try {
    const { year, mainSerie, exclusiveSerie, userProperty } = req.body;
    const { user } = req.session;

    //#region GET / SAVE FILTERS
    let yearToFilter: number = BASIC_DEFAULT_YEAR;
    let mainSerieToFilter: string | null = null;
    let exclusiveSerieToFilter: string | null = null;
    // ! Falta implementar el userPropertyFilter
    let userPropertyToFilter: USER_PROPERTY | null = null;
    if (user) {
      yearToFilter =
        (await getFilter(user, BASIC_CARS_PAGE, year, 'year')) ??
        BASIC_DEFAULT_YEAR;
      mainSerieToFilter = await getFilter(
        user,
        BASIC_CARS_PAGE,
        mainSerie,
        'mainSerie'
      );
      exclusiveSerieToFilter = await getFilter(
        user,
        BASIC_CARS_PAGE,
        exclusiveSerie,
        'exclusiveSerie'
      );
      userPropertyToFilter = await getFilter(
        user,
        BASIC_CARS_PAGE,
        userProperty,
        'userProperty'
      );
    }
    //#endregion GET / SAVE FILTERS

    //#region QUERY FILTERS
    const where: WhereOptions = {
      year: yearToFilter,
      ...getSeriesFilters(mainSerieToFilter, exclusiveSerieToFilter),
    };
    //#endregion QUERY FILTERS

    //#region QUERIES
    let cars: BasicCar[] = [];
    if (user) {
      BasicCar.belongsToMany(User, { through: UserBasicCar });
      User.belongsToMany(BasicCar, { through: UserBasicCar });
      cars = await BasicCar.findAll({
        where,
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
      cars = await BasicCar.findAll({ where });
    }
    //#endregion QUERIES

    return res.json({
      ok: true,
      data: {
        cars,
        filters: {
          year: yearToFilter,
          mainSerie: mainSerieToFilter,
          exclusiveSerie: exclusiveSerieToFilter,
          userProperty: userPropertyToFilter,
        },
      },
    });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const getBasicCar = async (
  req: Request<{}, ResponseDTO<BasicCar>, BasicCarPayload>,
  res: Response<ResponseDTO<BasicCar>>
) => {
  try {
    return res.json();
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};
