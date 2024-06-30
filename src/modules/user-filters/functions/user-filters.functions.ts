import { Op } from 'sequelize';
import { USER_PROPERTY } from '../../../shared/models/cars.models';
import { SessionUser } from '../../../shared/models/session.models';
import { UserFilters } from '../models/user-filters.models';

/**
 * @param filterValue undefined ? finds it in DB; returns filter of DB
 * @param filterValue null ? deletes filter in DB; returns null
 * @param filterValue value ? saves it in DB; returns it
 */
export const getFilter = async <TValue>(
  user: SessionUser | null,
  userFilters: UserFilters | null,
  page: string,
  filterValue: undefined | null | TValue,
  filterName: string
): Promise<TValue | null> => {
  if (!user) return filterValue ?? null;
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
    // console.log(!!userFilters);
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

export const getUserPropertyCondition = (
  userPropertyToFilter: USER_PROPERTY,
  table: string
) => {
  const hasCar = `$Users.${table}.hasCar$`;
  const wantsCar = `$Users.${table}.wantsCar$`;
  if (userPropertyToFilter === USER_PROPERTY.OWNED) {
    return {
      [Op.or]: [{ [hasCar]: 1 }],
    };
  } else if (userPropertyToFilter === USER_PROPERTY.WISHED) {
    return {
      [Op.or]: [{ [wantsCar]: 1 }],
    };
  } else if (userPropertyToFilter === USER_PROPERTY.NOT_OWNED) {
    return {
      [Op.or]: [{ [hasCar]: null }, { [wantsCar]: null }],
    };
  }
  return { error: true };
};
