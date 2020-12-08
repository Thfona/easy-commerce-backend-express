import Joi, { Schema } from 'joi';
import { errorMessageUtil } from './error-message.util';
import { generalFunctionsUtil } from './general-functions.util';
import { ParsedValidationResult } from '../interfaces/parsed-validation-result.interface';

class ValidatorUtil {
  private schemas = {
    login: Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6).max(1024),
      persistSession: Joi.boolean().required()
    }),
    user: Joi.object({
      name: Joi.object({
        first: Joi.string().required().min(3).max(255),
        last: Joi.string().required().min(3).max(255)
      }).required(),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6).max(1024)
    }),
    setNewValidationToken: Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6).max(1024)
    })
  };

  public validate(schemaName: string, data: any): ParsedValidationResult {
    const schema: Schema = generalFunctionsUtil.getKeyValue(schemaName)(this.schemas);

    const validation = schema.validate(data);

    const parsedErrorMessage =
      validation.error &&
      validation.error.details &&
      validation.error.details[0] &&
      validation.error.details[0].message &&
      errorMessageUtil.parseErrorMessage(validation.error.details[0].message);

    return {
      ...validation,
      parsedErrorMessage: parsedErrorMessage || ''
    };
  }
}

export const validatorUtil = new ValidatorUtil();
