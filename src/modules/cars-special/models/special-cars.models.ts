import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';
import { USER_PROPERTY } from '../../../shared/models/cars.models';

//#region SEQUELIZE
export class SpecialCar extends Model {
  id!: number;
  car_id!: string;
  model_name!: string;
  main_serie!: string;
  secondary_serie!: string;
  col_serie!: string | null;
  year!: number;
  brand!: string;
  img!: string;
  card_img!: string;
  hasCar!: number;
  wantsCar!: number;
}
SpecialCar.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    car_id: { type: DataTypes.STRING, allowNull: false },
    model_name: { type: DataTypes.STRING, allowNull: false },
    main_serie: { type: DataTypes.STRING, allowNull: false },
    secondary_serie: { type: DataTypes.STRING, allowNull: false },
    col_serie: { type: DataTypes.STRING },
    year: { type: DataTypes.NUMBER, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    img: { type: DataTypes.STRING, allowNull: true },
    card_img: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize: SEQUELIZE,
    modelName: 'SpecialCar',
    tableName: 'special_cars',
    timestamps: false,
  }
);
//#endregion SEQUELIZE

export interface SpecialCarPayload {
  mainSerie: string;
  secondarySerie?: string | null;
  userProperty?: USER_PROPERTY | null;
}

export interface SpecialCarResponse {
  cars: SpecialCarsGrouped;
  filters: SpecialCarPayload | null;
  carsShowed: number;
  carsOwned: number;
}

export interface SpecialCarDTO {
  id: number;
  car_id: string;
  model_name: string;
  main_serie: string;
  secondary_serie: string;
  col_serie: string | null;
  year: number;
  brand: string;
  img: string;
  card_img: string;
  hasCar: number | null;
  wantsCar: number | null;
}

export type SpecialCarsGrouped = { [key: string]: SpecialCarDTO[] };

export interface SpecialCarFiltersResponse {
  mainSerie: string[];
  secondarySerie: string[];
  userProperty: USER_PROPERTY[];
}
