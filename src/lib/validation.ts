import xss from 'xss';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export function validationCheck(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        const errors = validation.array();
        const notFoundError = errors.find((error: { msg: string }) => error.msg === 'not found');
        const serverError = errors.find((error: { msg: string }) => error.msg === 'server error');

        let status = 400;

        if (serverError) {
            status = 500;
        } else if (notFoundError) {
            status = 404;
        }

        return res.status(status).json({ errors });
    }
  
    return next();
  }
  export function atLeastOneBodyValueValidator(fields: Array<string>) {
    return body().custom(async (value: string, { req }) => {
      const { body: reqBody } = req;
  
      let valid = false;
  
      for (let i = 0; i < fields.length; i += 1) {
        const field = fields[i];
  
        if (field in reqBody && reqBody[field] != null) {
          valid = true;
          break;
        }
      }
  
      if (!valid) {
        return Promise.reject(
          new Error(`require at least one value of: ${fields.join(', ')}`),
        );
      }
      return Promise.resolve();
    });
  }

export const xssSanitizer = (param: string) =>
    body(param).customSanitizer((v) => xss(v));

export const xssSanitizerMany = (params: string[]) =>
  params.map((param) => xssSanitizer(param));

export const genericSanitizer = (param: string) => body(param).trim().escape();

export const genericSanitizerMany = (params: string[]) =>
  params.map((param) => genericSanitizer(param));

  export const stringValidator = ({
    field = '',
    valueRequired = true,
    maxLength = 0,
    optional = false,
  } = {}) => {
    const val = body(field)
      .trim()
      .isString()
      .isLength({
        min: valueRequired ? 1 : undefined,
        max: maxLength ? maxLength : undefined,
      })
      .withMessage(
        [
          field,
          valueRequired ? 'required' : '',
          maxLength ? `max ${maxLength} characters` : '',
        ]
          .filter((i) => Boolean(i))
          .join(' '),
      );
  
    if (optional) {
      return val.optional();
    }
    return val;
  };

