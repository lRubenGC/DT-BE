import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const DATABASE = new Sequelize(
  'hot_wheels_api',
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: 'localhost',
    dialect: 'mysql',
    // logging: false
  }
);

export const API_PATHS = {
  auth: '/api/auth',
  availableSeries: '/api/available-filters',
  basicCars: '/api/basic-cars',
  customCars: '/api/custom-cars',
  premiumCars: '/api/premium-cars',
  searchCars: '/api/search',
  users: '/api/users',
  userBasicCars: '/api/user-basic-cars',
  userPremiumCar: '/api/user-premium-cars',
};
