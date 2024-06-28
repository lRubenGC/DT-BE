import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';
import { User } from '../../users/models/users.models';
import { BasicCar } from './basic-cars.models';

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

// ! No funciona
User.belongsToMany(BasicCar, { through: UserBasicCar });
BasicCar.belongsToMany(User, { through: UserBasicCar });
//#endregion SEQUELIZE
