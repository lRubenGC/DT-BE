import { Request, Response } from 'express';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { ResponseDTO } from '../../../shared/models/response.models';
import { User } from '../../users/models/users.models';
import {
  ACCESS_TOKEN,
  JWT_COOKIE_PROPS,
  REFRESH_TOKEN,
} from '../models/auth.constants';
import { LoginPayload, RegisterPayload } from '../models/auth.models';
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

export const login = async (
  req: Request<{}, ResponseDTO<User>, LoginPayload>,
  res: Response<ResponseDTO<User>>
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return getError(res, 401, ERROR.BAD_LOGIN);
    }
    const validPassword = bcryptjs.compareSync(
      password.toString(),
      user.password
    );
    if (!validPassword) {
      return getError(res, 401, ERROR.BAD_LOGIN);
    }
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.SECRETORPRIVATEKEY,
      { expiresIn: '30m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.SECRETORPRIVATEKEY,
      { expiresIn: '90d' }
    );
    return res
      .cookie(ACCESS_TOKEN, accessToken, JWT_COOKIE_PROPS)
      .cookie(REFRESH_TOKEN, refreshToken, JWT_COOKIE_PROPS)
      .json({ ok: true, data: user });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const register = async (
  req: Request<{}, ResponseDTO<User>, RegisterPayload>,
  res: Response<ResponseDTO<User>>
) => {
  try {
    const { email, password, username } = req.body;
    const encryptedPassword = bcryptjs.hashSync(
      password,
      bcryptjs.genSaltSync()
    );
    const user = await User.create({
      username,
      email,
      password: encryptedPassword,
    });
    res.json({ ok: true, data: user });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const logout = async (req: Request, res: Response<ResponseDTO>) => {
  res
    .clearCookie(ACCESS_TOKEN)
    .clearCookie(REFRESH_TOKEN)
    .json({ ok: true, data: null });
};
