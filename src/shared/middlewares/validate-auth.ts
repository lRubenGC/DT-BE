import { User } from '../../modules/users/models/users.models';
import { ERROR } from '../models/errors.models';

export const isValidUsername = async (username: string) => {
  if (!username) throw new Error(ERROR.USERNAME_BAD_PATTERN.toString());
  const validPattern = new RegExp('[a-zA-Z0-9_ñç]{3,16}$');
  if (!validPattern.test(username)) {
    throw new Error(ERROR.USERNAME_BAD_PATTERN.toString());
  }
};

export const isNotDuplicatedUsername = async (username: string) => {
  const user = await User.findOne({ where: { username } });
  if (!!user) throw new Error(ERROR.USERNAME_DUPLICATED.toString());
};

export const isValidEmail = async (email: string) => {
  if (!email) throw new Error(ERROR.EMAIL_BAD_PATTERN.toString());
  const validPattern = new RegExp('^[\\w.-]+@[\\w-]+(\\.[\\w-]{2,4})+$');
  if (!validPattern.test(email)) {
    throw new Error(ERROR.EMAIL_BAD_PATTERN.toString());
  }
};

export const isNotDuplicatedEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (!!user) throw new Error(ERROR.EMAIL_DUPLICATED.toString());
};

export const isValidPassword = async (password: string) => {
  if (!password) throw new Error(ERROR.PASSWORD_BAD_PATTERN.toString());
  const validPattern = new RegExp('^[a-zA-Z0-9_,-.*!?¿çñ@]{6,20}$');
  if (!validPattern.test(password)) {
    throw new Error(ERROR.PASSWORD_BAD_PATTERN.toString());
  }
};
