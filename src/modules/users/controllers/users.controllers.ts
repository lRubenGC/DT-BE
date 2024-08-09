import { Request, Response } from 'express';
import { CAR_TYPE, USER_PROPERTY } from '../../../shared/models/cars.models';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { UserBasicCar } from '../../cars-basic/models/basic-cars-relations.models';
import { BASIC_DEFAULT_YEAR } from '../../cars-basic/models/basic-cars.constants';
import { BasicCar, BasicCarsGrouped } from '../../cars-basic/models/basic-cars.models';
import { UserPremiumCar } from '../../cars-premium/models/premium-cars-relations.models';
import { PREMIUM_DEFAULT_MAIN_SERIE } from '../../cars-premium/models/premium-cars.constants';
import {
  PremiumCar,
  PremiumCarsGrouped,
} from '../../cars-premium/models/premium-cars.models';
import { UserSpecialCar } from '../../cars-special/models/special-cars-relations.models';
import { SPECIAL_DEFAULT_MAIN_SERIE } from '../../cars-special/models/special-cars.constants';
import {
  SpecialCar,
  SpecialCarsGrouped,
} from '../../cars-special/models/special-cars.models';
import {
  getFilters,
  getUserPropertyCondition,
} from '../../user-filters/functions/user-filters.functions';
import { getUserProfilePayload, User } from '../../users/models/users.models';
import {
  getUserBasicCars,
  getUserPremiumCars,
  getUserSpecialCars,
} from '../functions/get-cars.functions';
import { USERS_PAGE } from '../models/users.constants';
const bcryptjs = require('bcryptjs');

export const updateUser = async (
  req: Request<{}, {}, { username: string; email: string; password: string }>,
  res: Response<ResponseDTO<User>>
) => {
  try {
    //#region READONLY
    const { username, email, password } = req.body;
    const { user } = req.session;
    let changes = false;
    //#endregion READONLY

    //#region VALIDATIONS
    if (!user) return getError(res, 400, ERROR.USER_NOT_LOGGED_IN);
    const userDTO = await User.findByPk(user.id);
    if (!userDTO) return getError(res, 400, ERROR.USER_NOT_FOUND);
    //#endregion VALIDATIONS

    //#region USERNAME
    if (username && username !== userDTO.username) {
      const validUsername = new RegExp('[a-zA-Z0-9_ñç]{3,16}$');
      if (!validUsername.test(username))
        return getError(res, 400, ERROR.USERNAME_BAD_PATTERN);
      const u = await User.findOne({ where: { username } });
      if (u) return getError(res, 400, ERROR.USERNAME_DUPLICATED);
      userDTO.username = username;
      changes = true;
    }
    //#endregion USERNAME

    //#region EMAIL
    if (email && email !== userDTO.email) {
      const validEmail = new RegExp('^[\\w.-]+@[\\w-]+(\\.[\\w-]{2,4})+$');
      if (!validEmail.test(email)) return getError(res, 400, ERROR.EMAIL_BAD_PATTERN);
      const u = await User.findOne({ where: { email } });
      if (u) return getError(res, 400, ERROR.EMAIL_DUPLICATED);
      userDTO.email = email;
      changes = true;
    }
    //#endregion EMAIL

    //#region PASSWORD
    if (password) {
      const samePassword = bcryptjs.compareSync(password, userDTO.password);
      if (!samePassword) {
        const validPassword = new RegExp('^[a-zA-Z0-9_,-.*!?¿çñ@]{6,20}$');
        if (!validPassword.test(password))
          return getError(res, 400, ERROR.PASSWORD_BAD_PATTERN);
        const newPassword = bcryptjs.hashSync(password, bcryptjs.genSaltSync());
        userDTO.password = newPassword;
        changes = true;
      }
    }
    //#endregion PASSWORD

    if (!changes) return getError(res, 400, ERROR.FORM_UNCHANGED);
    await userDTO.save();
    return res.json({
      ok: true,
      data: userDTO,
    });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const getUserProfileCars = async (
  req: Request<{}, {}, getUserProfilePayload>,
  res: Response<
    ResponseDTO<{
      user: User;
      cars: BasicCarsGrouped | PremiumCarsGrouped | SpecialCarsGrouped;
      filters: getUserProfilePayload;
    }>
  >
) => {
  try {
    //#region READONLY
    BasicCar.belongsToMany(User, { through: UserBasicCar });
    User.belongsToMany(BasicCar, { through: UserBasicCar });
    PremiumCar.belongsToMany(User, { through: UserPremiumCar });
    User.belongsToMany(PremiumCar, { through: UserPremiumCar });
    SpecialCar.belongsToMany(User, { through: UserSpecialCar });
    User.belongsToMany(SpecialCar, { through: UserSpecialCar });
    const { username, carType, userProperty, mainFilter, secondaryFilter } = req.body;
    const { user } = req.session;
    //#endregion READONLY

    //#region VALIDATIONS
    if (userProperty !== USER_PROPERTY.OWNED && userProperty !== USER_PROPERTY.WISHED)
      return getError(res, 400, ERROR.BAD_PAYLOAD);
    const userProfile = await User.findOne({ where: { username } });
    if (!userProfile) return getError(res, 400, ERROR.USER_NOT_FOUND);
    //#endregion VALIDATIONS

    //#region FILTERS STORAGED
    const {
      carTypeToFilter,
      userPropertyToFilter,
      mainFilterToFilter,
      secondaryFilterToFilter,
    } = (await getFilters(
      user,
      USERS_PAGE,
      [carType, userProperty, mainFilter, secondaryFilter],
      ['carType', 'userProperty', 'mainFilter', 'secondaryFilter']
    )) as {
      carTypeToFilter: CAR_TYPE | undefined;
      userPropertyToFilter: USER_PROPERTY | undefined;
      mainFilterToFilter: string | undefined;
      secondaryFilterToFilter: string | undefined;
    };
    //#endregion FILTERS STORAGED

    //#region DEFAULT FILTERS
    const finalCarType: CAR_TYPE = carTypeToFilter ?? 'basic';
    const finalUserProperty: USER_PROPERTY = userPropertyToFilter ?? USER_PROPERTY.OWNED;
    const finalMainFilter =
      mainFilterToFilter ??
      (finalCarType === 'basic'
        ? BASIC_DEFAULT_YEAR
        : finalCarType === 'premium'
          ? PREMIUM_DEFAULT_MAIN_SERIE
          : SPECIAL_DEFAULT_MAIN_SERIE);
    //#endregion DEFAULT FILTERS

    //#region FILTERS QUERIES
    const userPropertyFilter =
      finalCarType === 'premium'
        ? getUserPropertyCondition(finalUserProperty, 'UserPremiumCar')
        : finalCarType === 'special'
          ? getUserPropertyCondition(finalUserProperty, 'UserSpecialCar')
          : getUserPropertyCondition(finalUserProperty, 'UserBasicCar');
    //#endregion FILTERS QUERIES

    //#region FINAL QUERIES
    const cars =
      finalCarType === 'premium'
        ? await getUserPremiumCars(
            userPropertyFilter,
            finalMainFilter,
            secondaryFilterToFilter,
            userProfile.id,
            user?.id
          )
        : finalCarType === 'special'
          ? await getUserSpecialCars(
              userPropertyFilter,
              finalMainFilter,
              secondaryFilterToFilter,
              userProfile.id,
              user?.id
            )
          : await getUserBasicCars(
              userPropertyFilter,
              finalMainFilter,
              secondaryFilterToFilter,
              userProfile.id,
              user?.id
            );
    //#endregion FINAL QUERIES

    return res.json({
      ok: true,
      data: {
        user: userProfile,
        cars,
        filters: {
          username,
          carType: finalCarType,
          mainFilter: finalMainFilter,
          secondaryFilter: secondaryFilterToFilter,
          userProperty: finalUserProperty,
        },
      },
    });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};
