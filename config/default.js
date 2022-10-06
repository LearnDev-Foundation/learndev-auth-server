import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV,
  project: process.env.PROJECT,
  allowed_origins: process.env.ALLOWED_ORIGINS,
};

export default config;
