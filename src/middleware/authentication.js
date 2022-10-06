import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/index.js';

export const authentication = async (req, res, next) => {
  /*
   * @token - refreshToken
   * @user - stores the data of the verified jsonwebtoken
   */

  const token = req.cookies.refreshtoken;
  if (req.isAuthenticated()) {
    return next();
  }
  if (!token) {
    throw new UnauthorizedError('Not authorized to access this route');
  } else {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    req.session.passport = {};
    req.session.passport.user = user.id;

    //reset the session cookies
    req.session.touch();
    return next();
  }
};

export const authorization = async (roles) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const role = req.user.role;

    if (roles.includes(role)) {
      return next();
    }
    throw new UnauthorizedError('Not authorized to access this route');
  };
};

export default authentication;
