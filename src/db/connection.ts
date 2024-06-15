import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();
const user = process.env.DB_USER!;
const pass = process.env.DB_PASSWORD!;
const db = new Sequelize("hot_wheels_api", user, pass, {
  host: "localhost",
  dialect: "mysql",
  // logging: false
});

export default db;
