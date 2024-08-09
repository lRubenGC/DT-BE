import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';
import { CAR_TYPE, USER_PROPERTY } from '../../../shared/models/cars.models';

//#region SEQUELIZE
export class User extends Model {
  id!: number;
  username!: string;
  email!: string;
  password!: string;
  status!: number;
  recoverToken?: string | null;
  recoverTokenDate?: Date | null;
  img?: string;
  csvDownloadDate?: Date | null;
}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    recoverToken: {
      type: DataTypes.STRING,
    },
    recoverTokenDate: {
      type: DataTypes.DATE,
    },
    img: {
      type: DataTypes.STRING,
    },
    csvDownloadDate: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: SEQUELIZE,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  }
);
//#endregion SEQUELIZE

User.prototype.toJSON = function () {
  const { password, ...user } = this.get({ plain: true });
  return user;
};

export interface getUserProfilePayload {
  username: string;
  carType?: CAR_TYPE | null;
  userProperty?: USER_PROPERTY | null;
  mainFilter?: string | number | null;
  secondaryFilter?: string | null;
}
