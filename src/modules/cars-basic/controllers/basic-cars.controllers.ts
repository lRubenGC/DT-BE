import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';
import { USER_PROPERTY } from '../../../shared/models/cars.models';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { getFilter } from '../../user-filters/functions/user-filters.functions';
import { getSeriesFilters } from '../functions/filters';
import {
  BASIC_CARS_PAGE,
  BASIC_DEFAULT_YEAR,
} from '../models/basic-cars.constants';
import {
  BasicCar,
  BasicCarDTO,
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

    //#region SAVE / GET FILTERS
    let yearToFilter: number = BASIC_DEFAULT_YEAR;
    let mainSerieToFilter: string | null = null;
    let exclusiveSerieToFilter: string | null = null;
    //TODO: Implement USER PROPERTY
    let userPropertyToFilter: USER_PROPERTY | null = null;
    if (user) {
      // TODO: Implement YEAR
      // yearToFilter = await getFilter(user, BASIC_CARS_PAGE, year + '', 'year');
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
    }
    //#endregion SAVE / GET FILTERS

    //#region FILTERS
    const where: WhereOptions = {
      year: yearToFilter,
      ...getSeriesFilters(mainSerieToFilter, exclusiveSerieToFilter),
    };
    //#endregion FILTERS

    //#region QUERIES
    const cars: BasicCar[] = await BasicCar.findAll({
      where,
      raw: true,
    });
    const carsDTO: BasicCarDTO[] = cars.map(
      car =>
        ({
          ...car,
          has_car: false,
          wants_car: false,
        }) as BasicCarDTO
    );
    //#endregion QUERIES
    return res.json({
      ok: true,
      data: {
        cars: carsDTO,
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
  req: Request<{}, ResponseDTO<BasicCarDTO>, BasicCarPayload>,
  res: Response<ResponseDTO<BasicCarDTO>>
) => {
  try {
    return res.json();
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};
