import { Request, Response } from 'express';
import { ERROR, getError } from '../../../shared/models/errors.models';
import { IResponse } from '../../../shared/models/response.models';
import { User } from '../../users/models/users.models';
import { LoginPayload, RegisterPayload } from '../models/auth.models';
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

export const login = async (
  req: Request<{}, IResponse<User>, LoginPayload>,
  res: Response<IResponse<User>>
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
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.SECRETORPRIVATEKEY,
      {
        expiresIn: '1h',
      }
    );
    return res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .json({ ok: true, data: user });
  } catch (error) {
    return getError(res, 500, ERROR.SERVER_ERROR, null, error);
  }
};

export const register = async (
  req: Request<{}, IResponse<User>, RegisterPayload>,
  res: Response<IResponse<User>>
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

export const logout = async (req: Request, res: Response) => {
  res.json('logout');
};

export const protectedRoute = async (req: Request, res: Response) => {
  res.json('protectedRoute');
};
