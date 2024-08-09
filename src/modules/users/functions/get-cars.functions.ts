import { Sequelize, WhereOptions } from 'sequelize';
import { getBasicSeriesFilters } from '../../cars-basic/functions/get-basic-series-filters';
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
import { CAR_TYPE, USER_PROPERTY } from '../../../shared/models/cars.models';

export const getUserBasicCars = async (
  userPropertyFilter: any,
  mainFilter: string | number,
  secondaryFilter: string | undefined,
  userProfileId: number,
  userVisitorId?: number
): Promise<{ cars: BasicCarsGrouped; secondaryFilters: string[] }> => {
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

  return cars.reduce<{ cars: BasicCarsGrouped; secondaryFilters: string[] }>(
    ({ cars, secondaryFilters }, item) => {
      const car: BasicCar = item.toJSON();
      const key = car.series.split(',')[0];
      if (!cars[key]) {
        cars[key] = [];
      }
      const carDTO: BasicCarDTO = { ...car, series: car.series.split(',') };
      cars[key].push(carDTO);
      if (!secondaryFilters.includes(carDTO.series[0])) {
        secondaryFilters.push(carDTO.series[0]);
      }
      return { cars, secondaryFilters };
    },
    { cars: {}, secondaryFilters: [] }
  );
};

export const getUserPremiumCars = async (
  userPropertyFilter: any,
  mainFilter: string | number,
  secondaryFilter: string | undefined,
  userProfileId: number,
  userVisitorId?: number
): Promise<{ cars: PremiumCarsGrouped; secondaryFilters: string[] }> => {
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

  return cars.reduce<{ cars: PremiumCarsGrouped; secondaryFilters: string[] }>(
    ({ cars, secondaryFilters }, item) => {
      const car: PremiumCar = item.toJSON();
      if (!cars[car.secondary_serie]) {
        cars[car.secondary_serie] = [];
      }
      cars[car.secondary_serie].push(car);
      if (!secondaryFilters.includes(car.secondary_serie)) {
        secondaryFilters.push(car.secondary_serie);
      }
      return { cars, secondaryFilters };
    },
    { cars: {}, secondaryFilters: [] }
  );
};

export const getUserSpecialCars = async (
  userPropertyFilter: any,
  mainFilter: string | number,
  secondaryFilter: string | undefined,
  userProfileId: number,
  userVisitorId?: number
): Promise<{ cars: SpecialCarsGrouped; secondaryFilters: string[] }> => {
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

  return cars.reduce<{ cars: SpecialCarsGrouped; secondaryFilters: string[] }>(
    ({ cars, secondaryFilters }, item) => {
      const car: SpecialCar = item.toJSON();
      if (!cars[car.secondary_serie]) {
        cars[car.secondary_serie] = [];
      }
      cars[car.secondary_serie].push(car);
      if (!secondaryFilters.includes(car.secondary_serie)) {
        secondaryFilters.push(car.secondary_serie);
      }
      return { cars, secondaryFilters };
    },
    { cars: {}, secondaryFilters: [] }
  );
};

export const getMainFilters = async (
  carType: CAR_TYPE,
  userProperty: USER_PROPERTY,
  UserId: number
): Promise<number[] | string[]> => {
  const propertyFilter =
    userProperty === USER_PROPERTY.OWNED ? { hasCar: true } : { wantsCar: true };
  switch (carType) {
    case 'basic':
      const userBasicCars = await UserBasicCar.findAll({
        where: { UserId, ...propertyFilter },
      });
      const basicCarIds = userBasicCars.map(car => car.BasicCarId);
      const basicCars = await BasicCar.findAll({
        where: { id: basicCarIds },
        attributes: ['year'],
      });
      const uniqueYears = [...new Set(basicCars.map(car => car.year))];
      return uniqueYears.sort((a: number, b: number) => b - a);
    case 'premium':
      const userPremiumCars = await UserPremiumCar.findAll({
        where: { UserId, ...propertyFilter },
      });
      const premiumCarIds = userPremiumCars.map(car => car.PremiumCarId);
      const premiumCars = await PremiumCar.findAll({
        where: { id: premiumCarIds },
        attributes: ['main_serie'],
      });
      const uniquePremiumSeries = [...new Set(premiumCars.map(car => car.main_serie))];
      return uniquePremiumSeries.sort();
    case 'special':
      const userSpecialCars = await UserSpecialCar.findAll({
        where: { UserId, ...propertyFilter },
      });
      const specialCarIds = userSpecialCars.map(car => car.SpecialCarId);
      const specialCars = await SpecialCar.findAll({
        where: { id: specialCarIds },
        attributes: ['main_serie'],
      });
      const uniqueSpecialSeries = [...new Set(specialCars.map(car => car.main_serie))];
      return uniqueSpecialSeries.sort();
  }
};
