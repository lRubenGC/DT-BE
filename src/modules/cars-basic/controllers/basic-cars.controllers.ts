import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { getSeriesFilters } from '../functions/filters';
import { isValidYear } from '../functions/validations';
import {
  BasicCar,
  BasicCarDTO,
  BasicCarPayload,
} from '../models/basic-cars.models';

export const getBasicCars = async (
  req: Request<{}, ResponseDTO<BasicCarDTO[]>, BasicCarPayload>,
  res: Response<ResponseDTO<BasicCarDTO[]>>
) => {
  try {
    //#region VALIDATIONS
    const { year, mainSerie, exclusiveSerie, userProperty } = req.body;
    if (!year || !isValidYear(year)) {
      return getError(res, 400, ERROR.BAD_PAYLOAD, ['year']);
    }
    //#endregion VALIDATIONS

    //#region FILTERS
    const where: WhereOptions = {
      year,
      ...getSeriesFilters(mainSerie, exclusiveSerie),
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
    return res.json({ ok: true, data: carsDTO });
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
