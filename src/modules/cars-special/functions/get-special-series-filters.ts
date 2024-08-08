import { Op } from 'sequelize';

export const getSpecialSeriesFilters = (secondarySerie: string | null | undefined) => {
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
