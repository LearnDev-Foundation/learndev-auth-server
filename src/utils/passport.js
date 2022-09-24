import passportLocal from 'passport-local';
import passport from 'passport';
import passportGoogle from 'passport-google-oauth20';
import User from '../database/models/User.js';

const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async function (email, password, done) {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'no user with this email' });
        }
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: 'password incorrect' });
        }

        done(null, user);
      } catch (error) {
        return done;
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:5000/user/auth/google/callback',
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const { sub: id, name, email, picture: image } = profile._json;
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            googleId: id,
            name,
            email,
            image,
            refreshToken,
          });
          return cb(null, user, accessToken);
        }
        cb(null, user);
      } catch (error) {
        cb(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ _id: id });
    done(null, { id: user.id });
  } catch (error) {
    done(error);
  }
});
