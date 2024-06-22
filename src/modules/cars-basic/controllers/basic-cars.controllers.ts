import { Request, Response } from 'express';
import { ERROR, getError } from '../../../shared/models/errors.models';
import {
  BasicCar,
  BasicCarDTO,
  BasicCarPayload,
} from '../models/basic-cars.models';
import { ResponseDTO } from '../../../shared/models/response.models';

export const getBasicCars = async (
  req: Request<{}, ResponseDTO<BasicCarDTO[]>, BasicCarPayload>,
  res: Response<ResponseDTO<BasicCarDTO[]>>
) => {
  try {
    const { year, mainSerie, userProperty } = req.body;
    if (!year) return getError(res, 400, ERROR.BAD_PAYLOAD, ['year']);
    const cars: BasicCar[] = await BasicCar.findAll({
      where: {
        year,
      },
      raw: true,
    });
    const carsDTO: BasicCarDTO[] = cars.map(
      car =>
        ({
          ...car,
          has_car: false,
          wants_car: false,
          exclusive: 0,
        }) as BasicCarDTO
    );
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
