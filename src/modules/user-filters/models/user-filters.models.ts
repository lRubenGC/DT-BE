import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';
import { User } from '../../users/models/users.models';

//#region SEQUELIZE
export class UserFilters extends Model {
  id!: number;
  user_id!: string;
  page!: string;
  filters!: string;
}
UserFilters.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    page: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filters: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: SEQUELIZE,
    modelName: 'UserFilters',
    tableName: 'user_filters',
    timestamps: false,
  }
);
//#endregion SEQUELIZE

UserFilters.sync();
