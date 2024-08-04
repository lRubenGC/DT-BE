import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';
import { USER_PROPERTY } from '../../../shared/models/cars.models';

//#region SEQUELIZE
export class PremiumCar extends Model {
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
PremiumCar.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    car_id: { type: DataTypes.STRING, allowNull: false },
    model_name: { type: DataTypes.STRING, allowNull: false },
    main_serie: { type: DataTypes.STRING, allowNull: false },
    secondary_serie: { type: DataTypes.STRING, allowNull: false },
    col_serie: { type: DataTypes.STRING },
    year: { type: DataTypes.NUMBER, allowNull: false },
    brand: { type: DataTypes.STRING },
    img: { type: DataTypes.STRING, allowNull: true },
    card_img: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize: SEQUELIZE,
    modelName: 'PremiumCar',
    tableName: 'premium_cars',
    timestamps: false,
  }
);
//#endregion SEQUELIZE

export interface PremiumCarPayload {
  mainSerie: string;
  secondarySerie?: string | null;
  userProperty?: USER_PROPERTY | null;
}

export interface PremiumCarResponse {
  cars: PremiumCarsGrouped;
  filters: PremiumCarPayload | null;
  carsShowed: number;
  carsOwned: number;
}

export interface PremiumCarDTO {
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

export type PremiumCarsGrouped = { [key: string]: PremiumCarDTO[] };

export interface PremiumCarFiltersResponse {
  mainSerie: string[];
  secondarySerie: string[];
  userProperty: USER_PROPERTY[];
}
