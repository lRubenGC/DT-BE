import { Op } from 'sequelize';

export const getPremiumSeriesFilters = (secondarySerie: string | null | undefined) => {
  const filters = secondarySerie
    ? [
        {
          secondary_serie: {
            [Op.eq]: secondarySerie,
          },
        },
      ]
    : [];

  return filters.length > 0 ? { [Op.and]: filters } : {};
};
