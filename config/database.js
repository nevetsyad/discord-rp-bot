const { Sequelize } = require('sequelize');
const { appLogger } = require('./security');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development'
      ? (msg) => appLogger.debug('SQL Query', { query: msg })
      : false,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 10000
    },
    retry: {
      max: 2,
      match: [
        'ConnectionError',
        'SequelizeConnectionError',
        'SequelizeConnectionRefusedError',
        'SequelizeHostNotReachableError',
        'SequelizeInvalidConnectionError'
      ]
    }
  }
);

module.exports = sequelize;
