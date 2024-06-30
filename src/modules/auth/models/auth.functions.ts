import { User } from '../../users/models/users.models';
const jwt = require('jsonwebtoken');

export const getToken = (user: User, expiresIn: string) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.SECRETORPRIVATEKEY,
    { expiresIn }
  );
};
