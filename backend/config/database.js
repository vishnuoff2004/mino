require('dotenv').config();

const databaseUrlEnv = process.env.SUPABASE_DB_URL
  ? 'SUPABASE_DB_URL'
  : process.env.DATABASE_URL
    ? 'DATABASE_URL'
    : undefined;

const ssl =
  process.env.DB_SSL === 'false'
    ? false
    : {
        require: true,
        rejectUnauthorized: false,
      };

const baseConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: ssl ? { ssl } : {},
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

module.exports = {
  development: {
    ...baseConfig,
    use_env_variable: databaseUrlEnv,
  },
  test: {
    ...baseConfig,
    database: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'booking_db_test',
    dialectOptions: {},
  },
  production: {
    ...baseConfig,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    use_env_variable: databaseUrlEnv,
  },
};
