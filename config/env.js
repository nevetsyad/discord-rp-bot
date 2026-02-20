const Joi = require('joi');

const VALID_SCHEMA_STRATEGIES = ['migrate', 'safe', 'alter', 'force'];

function boolFromEnv(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function getDefaultSchemaStrategy(nodeEnv) {
  if (nodeEnv === 'test') return 'safe';
  if (nodeEnv === 'development') return 'alter';
  return 'migrate';
}

function validateEnv(rawEnv = process.env) {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
    DISCORD_TOKEN: Joi.string().trim().min(20).required(),
    CLIENT_ID: Joi.string().trim().required(),
    GUILD_ID: Joi.string().trim().allow('', null),

    DB_HOST: Joi.string().trim().required(),
    DB_PORT: Joi.number().port().default(3306),
    DB_NAME: Joi.string().trim().required(),
    DB_USER: Joi.string().trim().required(),
    DB_PASSWORD: Joi.string().allow('').required(),

    DB_SCHEMA_STRATEGY: Joi.string().valid(...VALID_SCHEMA_STRATEGIES),
    ALLOW_DB_SYNC: Joi.string().allow('', null),

    JWT_SECRET: Joi.string().min(32).when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),

    OPENROUTER_API_KEY: Joi.string().trim().allow('', null),
    ALLOWED_ORIGINS: Joi.string().allow('', null),
    PREFIX: Joi.string().default('!'),
    DEFAULT_COLOR: Joi.number().integer().min(0).max(16777215).default(5814783),
    MAX_CHARACTERS_PER_USER: Joi.number().integer().min(1).max(20).default(5),
    MAX_DICE_ROLLS: Joi.number().integer().min(1).max(100).default(10)
  }).unknown(true);

  const { value, error } = schema.validate(rawEnv, {
    abortEarly: false,
    convert: true,
    stripUnknown: false
  });

  if (error) {
    const details = error.details.map(d => d.message).join('; ');
    throw new Error(`Environment validation failed: ${details}`);
  }

  const schemaStrategy = value.DB_SCHEMA_STRATEGY || getDefaultSchemaStrategy(value.NODE_ENV);
  const allowDbSync = boolFromEnv(value.ALLOW_DB_SYNC, value.NODE_ENV !== 'production');

  if (value.NODE_ENV === 'production' && ['alter', 'force'].includes(schemaStrategy)) {
    throw new Error('Unsafe DB schema strategy in production. Use DB_SCHEMA_STRATEGY=migrate.');
  }

  if (value.NODE_ENV === 'production' && allowDbSync) {
    throw new Error('ALLOW_DB_SYNC=true is not allowed in production.');
  }

  return {
    ...value,
    DB_SCHEMA_STRATEGY: schemaStrategy,
    ALLOW_DB_SYNC: allowDbSync
  };
}

module.exports = {
  validateEnv,
  boolFromEnv,
  getDefaultSchemaStrategy,
  VALID_SCHEMA_STRATEGIES
};
