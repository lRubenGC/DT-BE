import { Request, Response } from 'express';
import { ERROR, getError } from '../../../shared/models/errors.models';
import {
  BasicCar,
  BasicCarDTO,
  BasicCarPayload,
} from '../models/basic-cars.models';

export const getBasicCars = async (
  req: Request<{}, BasicCarDTO[], BasicCarPayload>,
  res: Response<BasicCarDTO[]>
) => {
  const { year, mainSerie, userProperty } = req.body;
  if (!year) return getError(res, 400, ERROR.BAD_PAYLOAD, ['year']);
  try {
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
    return res.json(carsDTO);
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const getBasicCar = async (
  req: Request<{}, BasicCarDTO, BasicCarPayload>,
  res: Response<BasicCarDTO>
) => {
  return getError(res, 500, ERROR.SERVER_ERROR, null, 'aa');
};
