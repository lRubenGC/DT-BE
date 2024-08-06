import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';

//#region SEQUELIZE
export class UserPremiumCar extends Model {
  public id?: number;
  public UserId!: number;
  public PremiumCarId!: number;
  public hasCar!: number;
  public wantsCar!: number;
}

UserPremiumCar.init(
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
    modelName: 'UserPremiumCar',
    tableName: 'user_premium_cars',
    timestamps: false,
  }
);
//#endregion SEQUELIZE
