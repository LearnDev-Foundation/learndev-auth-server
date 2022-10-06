import User from '../database/models/User.js';
import validation from '../database/validations/userValidation.js';
import crypto from 'crypto';
import { mailService } from '../utils/email.js';
import logger from '../utils/logger.js';
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/index.js';
import jwt from 'jsonwebtoken';
import generateOtp from '../utils/generateOtp.js';
import sendEmail from '../utils/sendEmail.js';
import sendSms from '../utils/sendMessage.js';

export const register = async (req, res, next) => {
  try {
    const { error } = validation(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }
    const { email } = req.body;
    const user = await User.create(req.body);
    const verificationToken = crypto.randomBytes(48).toString('hex');
    await mailService({
      email: user.email,
      name: user.name,
      subject: 'Verify your account',
      link: process.env.APP_URL,
      token: verificationToken,
      view: 'verify.ejs',
    });

    user.verificationToken = verificationToken;
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const verificationToken = req.params.id;
    logger.info(`Token received from server: ${verificationToken}`);
    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(403).json('Invalid credentials');
    }
    user.isVerified = true;
    user.verificationToken = '';
    await user.save();
    await mailService({
      email: user.email,
      name: user.name,
      subject: 'Account verified',
      link: process.env.VERIFIED_REDIRECT_URL,
      view: 'welcome.ejs',
    });
    res.status(200).render('activated', { name: user.name || 'User' });
    return;
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Provide email and password');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid Credentials');
    }

    const ismatch = await user.comparPassword(password);
    if (!ismatch) {
      throw new UnauthorizedError('Invalid email or password');
    }
    let payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    };

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_LIFE,
    });
    user.refreshToken = refreshToken;

    res.cookie('refreshToken', refreshToken, {
      maxAge,
    });
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_LIFE,
    });
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      maxAge: process.env.REFRESH_TOKEN_LIFE,
    });

    res.redirect(process.env.REDIRECT_URL);
    return;
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { contact } = req.body;

    //checking if contact is email
    const isMatch = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
      contact
    );
    let user = {};
    if (isMatch) {
      user = await User.findOne({ email: contact });
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }
      //generate Otp
      const otpUser = generateOtp(user);
      //adding otp schema
      user.otp = otpUser;
      await user.save();

      const html = `<strong> Forgot Password </strong> <p>${otpUser.otpToken}</p>`;
      const subject = process.env.PROJECT;
      const to = contact;
      await sendEmail({ to, html, subject });
    }
    //if contact is phone number
    else {
      user = await User.findOne({ phone: contact });
      if (!user) {
        error = { statusCode: 400, message: 'invalid credentials' };
        next(error);
      }
      //generate otp
      const otpUser = generateOtp(user);
      //adding otp schema
      user.Otp = otpUser;
      await user.save();

      const text = `${otpUser.otpToken}`;
      const otp = otpUser.otpToken;

      //send message
      let to = '234';
      if (contact.startsWith('0')) {
        to += contact.replace('0', '');
      } else {
        to += contact;
      }
      await sendSms({ to, otp });
    }
    res.status(200).json({ id: user._id });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const {
      params: { id: userId },
    } = req;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError(`no user with id ${userId}`);
    }
    const { otp } = user;

    if (!otp) {
      throw new UnauthorizedError(`user with id ${userId} has no otp`);
    }
    const otpNumber = req.body;
    if (!otpNumber) {
      throw new BadRequestError(`Provide Otp`);
    }
    const currentDate = new Date();
    const currentTime = currentDate.getTime();
    if (!(otp.otpLife >= currentTime)) {
      return res.status(400).json('otp has expired');
    }
    otp.isValid = true;
    await user.save();
    return res.status(200).json({ id: user._id });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });
    const { otp } = user;
    if (!otp?.isValid) {
      throw new ForbiddenError('request is forbidden');
    }
    const { password, confirmPassword } = req.body;
    if (password != confirmPassword) {
      throw new UnauthorizedError('Password does not match');
    }
    user.password = password;
    await user.otp.remove();
    await user.save();

    res
      .status(200)
      .json({ status: 'success', msg: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken');
    req.session.destroy(function (err) {
      if (err) throw err;
    });
    return res.redirect('/');
  } catch (error) {
    next();
  }
};
