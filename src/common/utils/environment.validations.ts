import * as Joi from 'joi';

export const validationSchema = Joi.object({
  ENVIRONMENT_NAME: Joi.string().required(),
  APP_NAME: Joi.string().required(),
  APP_AUTHOR: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  APP_PROD: Joi.boolean().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_SYNC: Joi.boolean().required(),
  DB_LOGGIN: Joi.boolean().required(),
  DB_LOAD_ENTITIES: Joi.boolean().required(),
  DB_MIGRATIONS: Joi.boolean().required(),
  DB_SSL: Joi.boolean().required(),
  BOT_API_KEY: Joi.string().required(),
  BOT_API_SECRET: Joi.string().required(),
});
