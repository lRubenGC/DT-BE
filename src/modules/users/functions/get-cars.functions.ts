import { Sequelize, WhereOptions } from 'sequelize';
import { UserBasicCar } from '../../cars-basic/models/basic-cars-relations.models';
import {
  BasicCar,
  BasicCarDTO,
  BasicCarsGrouped,
} from '../../cars-basic/models/basic-cars.models';
import { getPremiumSeriesFilters } from '../../cars-premium/functions/get-premium-series-filters';
import { UserPremiumCar } from '../../cars-premium/models/premium-cars-relations.models';
import {
  PremiumCar,
  PremiumCarsGrouped,
} from '../../cars-premium/models/premium-cars.models';
import { getSpecialSeriesFilters } from '../../cars-special/functions/get-special-series-filters';
import { UserSpecialCar } from '../../cars-special/models/special-cars-relations.models';
import {
  SpecialCar,
  SpecialCarsGrouped,
} from '../../cars-special/models/special-cars.models';
import { User } from '../models/users.models';
import { getBasicSeriesFilters } from '../../cars-basic/functions/get-basic-series-filters';

export const getUserBasicCars = async (
  userPropertyFilter: any,
  mainFilter: string | number,
  secondaryFilter: string | undefined,
  userProfileId: number,
  userVisitorId?: number
): Promise<BasicCarsGrouped> => {
  const coreFilters: WhereOptions = {
    year: mainFilter,
    ...getBasicSeriesFilters(secondaryFilter, null),
  };
  const cars = await BasicCar.findAll({
    where: { ...coreFilters, ...userPropertyFilter },
    include: [
      {
        model: User,
        attributes: [],
        through: {
          attributes: [],
          where: { UserId: userProfileId },
        },
      },
    ],
    attributes: {
      include: [
        [Sequelize.literal('false'), 'hasCar'],
        [Sequelize.literal('false'), 'wantsCar'],
      ],
    },
    order: [['col_serie', 'ASC']],
  });

  if (userVisitorId) {
    const visitorCars = await UserBasicCar.findAll({
      where: { UserId: userVisitorId, BasicCarId: cars.map(car => car.id) },
      attributes: ['BasicCarId', 'hasCar', 'wantsCar'],
    });
    const visitorCarsMap = visitorCars.reduce<Record<number, UserBasicCar>>(
      (acc, prop) => {
        acc[prop.BasicCarId] = prop;
        return acc;
      },
      {}
    );
    cars.forEach(car => {
      const prop = visitorCarsMap[car.id];
      if (prop) {
        car.setDataValue('hasCar', prop.hasCar);
        car.setDataValue('wantsCar', prop.wantsCar);
      }
    });
  }

  return cars.reduce<BasicCarsGrouped>((acc, item) => {
    const car: BasicCar = item.toJSON();
    const key = car.series.split(',')[0];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({ ...car, series: car.series.split(',') } as BasicCarDTO);
    return acc;
  }, {});
};

export const getUserPremiumCars = async (
  userPropertyFilter: any,
  mainFilter: string | number,
  secondaryFilter: string | undefined,
  userProfileId: number,
  userVisitorId?: number
): Promise<PremiumCarsGrouped> => {
  const coreFilters: WhereOptions = {
    main_serie: mainFilter,
    ...getPremiumSeriesFilters(secondaryFilter),
  };
  const cars = await PremiumCar.findAll({
    where: { ...coreFilters, ...userPropertyFilter },
    include: [
      {
        model: User,
        attributes: [],
        through: {
          attributes: [],
          where: { UserId: userProfileId },
        },
      },
    ],
    attributes: {
      include: [
        [Sequelize.literal('false'), 'hasCar'],
        [Sequelize.literal('false'), 'wantsCar'],
      ],
    },
    order: [['col_serie', 'ASC']],
  });

  if (userVisitorId) {
    const visitorCars = await UserPremiumCar.findAll({
      where: { UserId: userVisitorId, PremiumCarId: cars.map(car => car.id) },
      attributes: ['PremiumCarId', 'hasCar', 'wantsCar'],
    });
    const visitorCarsMap = visitorCars.reduce<Record<number, UserPremiumCar>>(
      (acc, prop) => {
        acc[prop.PremiumCarId] = prop;
        return acc;
      },
      {}
    );
    cars.forEach(car => {
      const prop = visitorCarsMap[car.id];
      if (prop) {
        car.setDataValue('hasCar', prop.hasCar);
        car.setDataValue('wantsCar', prop.wantsCar);
      }
    });
  }

  return cars.reduce<PremiumCarsGrouped>((acc, item) => {
    const car: PremiumCar = item.toJSON();
    if (!acc[car.secondary_serie]) {
      acc[car.secondary_serie] = [];
    }
    acc[car.secondary_serie].push(car);
    return acc;
  }, {});
};

export const getUserSpecialCars = async (
  userPropertyFilter: any,
  mainFilter: string | number,
  secondaryFilter: string | undefined,
  userProfileId: number,
  userVisitorId?: number
): Promise<SpecialCarsGrouped> => {
  const coreFilters: WhereOptions = {
    main_serie: mainFilter,
    ...getSpecialSeriesFilters(secondaryFilter),
  };
  const cars = await SpecialCar.findAll({
    where: { ...coreFilters, ...userPropertyFilter },
    include: [
      {
        model: User,
        attributes: [],
        through: {
          attributes: [],
          where: { UserId: userProfileId },
        },
      },
    ],
    attributes: {
      include: [
        [Sequelize.literal('false'), 'hasCar'],
        [Sequelize.literal('false'), 'wantsCar'],
      ],
    },
    order: [['col_serie', 'ASC']],
  });

  if (userVisitorId) {
    const visitorCars = await UserSpecialCar.findAll({
      where: { UserId: userVisitorId, SpecialCarId: cars.map(car => car.id) },
      attributes: ['SpecialCarId', 'hasCar', 'wantsCar'],
    });
    const visitorCarsMap = visitorCars.reduce<Record<number, UserSpecialCar>>(
      (acc, prop) => {
        acc[prop.SpecialCarId] = prop;
        return acc;
      },
      {}
    );
    cars.forEach(car => {
      const prop = visitorCarsMap[car.id];
      if (prop) {
        car.setDataValue('hasCar', prop.hasCar);
        car.setDataValue('wantsCar', prop.wantsCar);
      }
    });
  }

  return cars.reduce<SpecialCarsGrouped>((acc, item) => {
    const car: SpecialCar = item.toJSON();
    if (!acc[car.secondary_serie]) {
      acc[car.secondary_serie] = [];
    }
    acc[car.secondary_serie].push(car);
    return acc;
  }, {});
};
