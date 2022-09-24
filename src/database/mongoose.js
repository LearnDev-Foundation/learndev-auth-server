import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

//required environment variables
// ['NODE_ENV', 'PORT'].forEachi((name) => {
//     if(!process.env[name]){
//         logger.error(`Environment variable ${name} is missing`);
//         process.exit(1);
//     }
// });

export const connectDB = (poolSize = 20, autoIndex = true) => {
  let dbName;
  let connectionString;
  switch (process.env.NODE_ENV) {
    case 'production':
      dbName = process.env.MONGO_DATABASE;
      connectionString = `monogodb+srv://${encodeURIComponent(
        process.env.MONGO_USER
      )}:${encodeURIComponent(process.env.MONGO_PASS)}@${
        process.env.MONGO_HOST
      }/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;
      break;
    case 'staging':
      dbName = process.env.MONGO_DATABASE;
      connectionString = `monogodb+srv://${encodeURIComponent(
        process.env.MONGO_USER
      )}:${encodeURIComponent(process.env.MONGO_PASS)}@${
        process.env.MONGO_HOST
      }/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;
      break;
    default:
      dbName = process.env.MONGO_DATABASE;
      mongoose.set('debug', true);
      connectionString = 'mongodb://localhost:27017';
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex,
    dbName,
  };

  const db = mongoose.connect(connectionString, options).catch((err) => {
    if (err.message.indexOf('ECONNREFUSED') !== -1) {
      logger.error(
        'Error: The server was not able to reach MongoDB. Maybe it"s not running?'
      );
      process.exit(1);
    } else {
      throw err;
    }
  });
  db.then(() => {
    logger.info('Successfully connected to MongoDB');
  }).catch((error) => {
    logger.error('An error occurred while trying to connect to MongoDB', {
      error: error.toString(),
    });
  });

  return db;
};
