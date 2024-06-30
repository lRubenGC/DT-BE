import { Op } from 'sequelize';

export const getSeriesFilters = (mainSerie: string | null, exclusiveSerie: string | null) => {
  const filters = [];
  if (mainSerie) {
    filters.push({
      series: {
        [Op.like]: `%${mainSerie}%`,
      },
    });
  }
  if (exclusiveSerie) {
    filters.push({
      exclusive_serie: {
        [Op.eq]: exclusiveSerie,
      },
    });
  }

  return filters.length > 0 ? { [Op.and]: filters } : {};
};
