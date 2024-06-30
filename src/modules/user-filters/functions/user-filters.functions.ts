import { Op } from 'sequelize';
import { USER_PROPERTY } from '../../../shared/models/cars.models';
import { SessionUser } from '../../../shared/models/session.models';
import { UserFilters } from '../models/user-filters.models';

/**
 * @param filterValue undefined ? takes it of DB
 * @param filterValue null ? deletes filter in DB
 * @param filterValue value ? saves it in DB and takes it
 */
export const getFilters = async <TValue>(
  user: SessionUser | null,
  page: string,
  filterValues: (undefined | null | TValue)[],
  filterNames: string[]
): Promise<{ [key: string]: TValue | null }> => {
  if (!user) {
    return filterNames.reduce<{ [key: string]: TValue | null }>((acc, name, index) => {
      acc[`${name}ToFilter`] = filterValues[index] ?? null;
      return acc;
    }, {});
  }

  const userFilters = await UserFilters.findOne({
    where: {
      user_id: user.id,
      page,
    },
  });
  const userFiltersObj = userFilters ? JSON.parse(userFilters.filters) : {};
  const result = filterNames.reduce<{ [key: string]: TValue | null }>(
    (acc, name, index) => {
      if (filterValues[index] === undefined && !!userFiltersObj[name]) {
        acc[`${name}ToFilter`] = userFiltersObj[name];
      } else if (!!filterValues[index]) {
        acc[`${name}ToFilter`] = filterValues[index]!;
        userFiltersObj[name] = filterValues[index];
      } else {
        delete userFiltersObj[name];
      }
      return acc;
    },
    {}
  );

  if (Object.keys(userFiltersObj).length > 0) {
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
  } else if (userFilters) {
    await userFilters.destroy();
  }
  return result;
};

export const getUserPropertyCondition = (
  userPropertyToFilter: USER_PROPERTY,
  model: string
) => {
  const hasCar = `$Users.${model}.hasCar$`;
  const wantsCar = `$Users.${model}.wantsCar$`;
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
