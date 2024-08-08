import { Request, Response } from 'express';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { User } from '../../users/models/users.models';
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
