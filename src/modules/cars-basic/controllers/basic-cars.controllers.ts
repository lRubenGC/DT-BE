import { Request, Response } from 'express';
import { Sequelize, WhereOptions } from 'sequelize';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import {
  getFilter,
  getUserPropertyCondition,
} from '../../user-filters/functions/user-filters.functions';
import { UserFilters } from '../../user-filters/models/user-filters.models';
import { User } from '../../users/models/users.models';
import { getSeriesFilters } from '../functions/get-series-filters';
import { UserBasicCar } from '../models/basic-cars-relations.models';
import { BASIC_CARS_PAGE, BASIC_DEFAULT_YEAR } from '../models/basic-cars.constants';
import { BasicCar, BasicCarPayload, BasicCarResponse } from '../models/basic-cars.models';

export const getBasicCars = async (
  req: Request<{}, ResponseDTO<BasicCarResponse>, BasicCarPayload>,
  res: Response<ResponseDTO<BasicCarResponse>>
) => {
  try {
    BasicCar.belongsToMany(User, { through: UserBasicCar });
    User.belongsToMany(BasicCar, { through: UserBasicCar });
    const { year, mainSerie, exclusiveSerie, userProperty } = req.body;
    const { user } = req.session;

    //#region GET / SAVE FILTERS
    const yearToFilter =
      (await getFilter(user, BASIC_CARS_PAGE, year, 'year')) ?? BASIC_DEFAULT_YEAR;
    const mainSerieToFilter = await getFilter(
      user,
      BASIC_CARS_PAGE,
      mainSerie,
      'mainSerie'
    );
    const exclusiveSerieToFilter = await getFilter(
      user,
      BASIC_CARS_PAGE,
      exclusiveSerie,
      'exclusiveSerie'
    );
    const userPropertyToFilter = await getFilter(
      user,
      BASIC_CARS_PAGE,
      userProperty,
      'userProperty'
    );
    //#endregion GET / SAVE FILTERS

    //#region QUERY FILTERS
    const filters: WhereOptions = {
      year: yearToFilter,
      ...getSeriesFilters(mainSerieToFilter, exclusiveSerieToFilter),
    };
    const userPropertyFilters =
      user && userPropertyToFilter
        ? getUserPropertyCondition(userPropertyToFilter, 'UserBasicCar')
        : null;
    if (userPropertyFilters && userPropertyFilters.error) {
      return getError(res, 400, ERROR.BAD_PAYLOAD, ['UserProperty']);
    }
    //#endregion QUERY FILTERS

    //#region QUERIES
    let cars: BasicCar[] = [];
    if (user) {
      cars = await BasicCar.findAll({
        where: { ...filters, ...userPropertyFilters },
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
      cars = await BasicCar.findAll({ where: filters });
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
