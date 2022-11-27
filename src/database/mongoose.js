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
  let connectionString = process.env.MONGODB_URI;

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
