import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';

//#region SEQUELIZE
export class UserBasicCar extends Model {
  public id!: number;
  public UserId!: number;
  public BasicCarId!: number;
  public hasCar!: number;
  public wantsCar!: number;
}

UserBasicCar.init(
  {
    hasCar: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    wantsCar: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize: SEQUELIZE,
    modelName: 'UserBasicCar',
    tableName: 'user_basic_cars',
    timestamps: false,
  }
);
//#endregion SEQUELIZE
