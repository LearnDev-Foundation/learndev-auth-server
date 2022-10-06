import { Router } from 'express';
import passport from 'passport';
import {
  forgotPassword,
  googleLogin,
  login,
  logout,
  register,
  resetPassword,
  verifyOtp,
  verifyUser,
} from '../controllers/authController.js';
import { authentication, authorization } from '../middleware/authentication.js';

const route = Router();

route.post('/register', register);
route.post(
  '/login',
  passport.authenticate('local', { successMessage: 'login' }),
  login
);
route.post('/forgotPassword', forgotPassword);
route.get('/logout', authentication, logout);
route.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
route.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleLogin
);
// route.post('/password/:id', authentication, changePassword)
route.get('/verifyUser/:id', verifyUser);
route.post('/verifyToken/:id', verifyOtp);
route.post('/resetPassword/:id', resetPassword);

export default route;
