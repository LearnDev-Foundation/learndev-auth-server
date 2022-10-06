import express from 'express';
import config from './config/default.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import MongoStore from 'connect-mongo';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';
import logger from './src/utils/logger.js';
import { connectDB } from './src/database/mongoose.js';
import userRoute from './src/routers/userRoute.js';

const app = express();
const port = config.port;
dotenv.config();

//resolved path issue
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

//setup helmet
// Helmet consist of 13 whooping package all working together to prevent malicious parties
// from breaking into an application to affecting it's user
app.use(helmet());

//setting views and view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); //this isn't necessary cause nodejs will identify view when using ejs

app.use(express.static(path.join(__dirname, 'public'))); //express.static is used to serve files as static(e.g images)

//Body Parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

// log only 4xx or 5xx responses to console
const logFormat = config.env == 'production' ? 'combined' : 'development';

//using morgan (morgan whats return in the req and res body for the next middleware)
//statement meaning: return statusCode if it's less than 500 code i.e 200-499
app.use(
  morgan(logFormat, {
    skip(req, res) {
      return res.statusCode < 500;
    },
  })
);

// Enable CORS
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed_origins = config.allowed_origins;
      if (allowed_origins.trim() == '*') {
        cb(null, true);
      } else {
        const origins = allowed_origins.split(',');
        if (origin.indexOf(origin) != 1 || !origin) {
          cd(null, true);
        } else {
          cd(new Error(`Origin${origin} not allowed`, false));
        }
      }
    },
    optionsSuccessStatus: 200, //some legacy browsers (IE11, various SmartTVs) will choke on 204
  })
);

//session
let connectionString;
if (process.env.NODE_ENV == 'production') {
  connectionString = `monogodb+srv://${encodeURIComponent(
    process.env.MONGO_USER
  )}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_HOST}/${
    process.env.MONGO_DATABASE
  }?retryWrites=true&w=majority`;
} else {
  connectionString = `mongodb://localhost:27017/${process.env.MONGO_DATABASE}Alt`;
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: Number(process.env.SESSION_LIFE), httpOnly: false },
    store: MongoStore.create({ mongoUrl: connectionString }),
  })
);

//passport - pending
import './src/utils/passport.js';
import passport from 'passport';
app.use(passport.initialize());
app.use(passport.session());

//Base Url
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API v1 is running',
    env: config.env,
    project: config.project,
  });
});

app.use(userRoute);

//general error handler
app.use((err, req, res, next) => {
  logger.info(
    `Error occured. ErrorCode: ${err.statusCode}, msg: ${err.message}`
  );
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

//unavaliable route error handler
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 404;
  err.statusCode = 404;
  next(err);
});

app.listen(port, async () => {
  logger.info(`Environment: ${config.env}`);
  logger.info('connecting to database ...');
  await connectDB();
  logger.info(`server is listening on port ${port}`);
});
