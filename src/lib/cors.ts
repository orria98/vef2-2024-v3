import { NextFunction, Request, Response } from 'express';

/**
 * Set CORS headers
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function cors(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  next();
}