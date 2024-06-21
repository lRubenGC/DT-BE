import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const SEQUELIZE = new Sequelize(
  'hot_wheels_api',
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: 'localhost',
    dialect: 'mysql',
    // logging: false
  }
);
