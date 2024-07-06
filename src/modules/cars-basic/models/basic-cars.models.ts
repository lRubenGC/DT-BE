import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';
import { USER_PROPERTY } from '../../../shared/models/cars.models';

//#region SEQUELIZE
export class BasicCar extends Model {
  id!: number;
  car_id!: string;
  col!: number;
  model_name!: string;
  version!: string;
  series!: string;
  exclusive_serie!: string | null;
  col_serie!: string;
  year!: number;
  brand!: string;
  img!: string;
  hasCar!: number;
  wantsCar!: number;
}
BasicCar.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    car_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    col: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    series: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exclusive_serie: {
      type: DataTypes.STRING,
    },
    col_serie: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: SEQUELIZE,
    modelName: 'BasicCar',
    tableName: 'basic_cars',
    timestamps: false,
  }
);
//#endregion SEQUELIZE

export interface BasicCarResponse {
  groupedCars: BasicCarsGrouped;
  filters: BasicCarPayload | null;
}

export interface BasicCarPayload {
  year: number;
  mainSerie?: string | null;
  exclusiveSerie?: string | null;
  userProperty?: USER_PROPERTY | null;
}

export interface BasicCarDTO {
  id: number;
  car_id: string;
  col: number;
  model_name: string;
  version: string;
  series: string[];
  exclusive_serie: string | null;
  col_serie: string;
  year: number;
  brand: string;
  img: string;
  hasCar: number;
  wantsCar: number;
}

export type BasicCarsGrouped = { [key: string]: BasicCarDTO[] };
