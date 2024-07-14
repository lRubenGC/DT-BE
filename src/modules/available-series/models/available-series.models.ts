import { DataTypes, Model } from 'sequelize';
import { SEQUELIZE } from '../../../server/server.constants';

//#region SEQUELIZE
export class AvailableSeries extends Model {
  id!: number;
  series!: string;
  exclusive_series!: string | null;
}
AvailableSeries.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    series: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exclusive_series: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: SEQUELIZE,
    modelName: 'AvailableSeries',
    tableName: 'available_series',
    timestamps: false,
  }
);
//#endregion SEQUELIZE
