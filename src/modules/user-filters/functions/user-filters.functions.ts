import { SessionUser } from '../../../shared/models/session.models';
import { UserFilters } from '../models/user-filters.models';

/**
 * @param filterValue undefined ? finds it in DB; returns filter of DB
 * @param filterValue null ? deletes filter in DB; returns null
 * @param filterValue value ? saves it in DB; returns it
 */
export const getFilter = async <TValue>(
  user: SessionUser,
  page: string,
  filterValue: undefined | null | TValue,
  filterName: string
): Promise<TValue | null> => {
  const userFilters = await UserFilters.findOne({
    where: {
      user_id: user.id,
      page,
    },
  });
  const userFiltersObj = userFilters ? JSON.parse(userFilters.filters) : {};
  if (filterValue === undefined && userFilters) {
    return userFiltersObj[filterName];
  } else if (filterValue !== undefined) {
    if (filterValue === null) {
      delete userFiltersObj[filterName];
    } else {
      userFiltersObj[filterName] = filterValue;
    }
    const filters = JSON.stringify(userFiltersObj);
    if (userFilters) {
      await userFilters.update({ filters });
    } else {
      await UserFilters.create({
        user_id: user.id,
        page,
        filters,
      });
    }
    return filterValue;
  }
  return null;
};
