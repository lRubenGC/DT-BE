import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';

//#region SEQUELIZE
export class UserSpecialCar extends Model {
  public UserId!: number;
  public SpecialCarId!: number;
  public hasCar!: number;
  public wantsCar!: number;
}

UserSpecialCar.init(
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
    modelName: 'UserSpecialCar',
    tableName: 'user_special_cars',
    timestamps: false,
  }
);
//#endregion SEQUELIZE
