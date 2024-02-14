import type { NextFunction, Request, Response, Router, Express } from 'express';
import { AppError, InvalidToken } from './exceptions';
import type { AnyZodObject } from 'zod';
import { ZodError } from 'zod';
import { version } from './argvHandler';
import path from 'path';
import fs from 'fs';
import { verifyToken } from './tokens';
import { matchRoute, refreshRoutes } from './authenticatedRoutes';
import { Application, WebsocketRequestHandler } from 'express-ws';
import { WebSocket } from 'ws';
import { env } from './env';
// @ts-ignore
import routes from '@lib/routes';

declare module 'express' {
  interface Request {
    session?: { userId: string; token: string };
  }
}

export const authorisation = async (
  request: Request<unknown>,
  response: Response,
  next: NextFunction
) => {
  if (request.method === 'OPTIONS')
    return response.send({
      message: 'Preflight check successful.',
    });

  const token = request.headers.authorization?.split(' ')[1];

  const requestRoute = request.originalUrl.split('/').slice(1).join('/');

  // TODO: Re-enable refresh token check once MVP is done
  // if (token && refreshRoutes.includes(requestRoute)) {
  //   try {
  //     const tokenCheck = await verifyToken(token);

  //     if (tokenCheck.payload.typ !== 'refresh')
  //       return next(new AppError('unauthorised', 'Invalid token type'));

  //     request.session = { userId: tokenCheck.payload.sub, token };

  //     return next();
  //   } catch (e) {
  //     if (e instanceof InvalidToken) {
  //       return next(new AppError('validation', e.message));
  //     }

  //     return next(new AppError('validation', 'Invalid token'));
  //   }
  // }

  const match = matchRoute(requestRoute);

  if (match) return next();

  if (!request.headers.authorization)
    return next(
      new AppError('unauthorised', '`Authorization` header required')
    );

  if (!request.headers.authorization.startsWith('Bearer'))
    return next(
      new AppError(
        'unauthorised',
        '`Authorization` header must be a Bearer token'
      )
    );

  if (!token) return next(new AppError('unauthorised', 'No token provided'));

  try {
    const tokenCheck = await verifyToken(token);

    request.session = { userId: tokenCheck.payload.sub, token };

    next();
  } catch (e) {
    if (e instanceof InvalidToken) {
      return next(new AppError('unauthorised', e.message));
    }

    return next(new AppError('validation', 'Invalid token'));
  }
};

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request<unknown>, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const invalids = error.issues.map(issue => issue.path.pop());
        next(
          new AppError(
            'validation',
            `Invalid or missing input${
              invalids.length > 1 ? 's' : ''
            } provided for: ${invalids.join(', ')}`
          )
        );
      } else {
        next(new AppError('validation', 'Invalid input'));
      }
    }
  };

export const validateWs =
  (schema: AnyZodObject) =>
  async (ws: WebSocket, req: Request<unknown>, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const invalids = error.issues.map(issue => issue.path.pop());
        next(
          new AppError(
            'validation',
            `Invalid or missing input${
              invalids.length > 1 ? 's' : ''
            } provided for: ${invalids.join(', ')}`
          )
        );
      } else {
        next(new AppError('validation', 'Invalid input'));
      }
    }
  };

export const errorHandler = (
  error: Error,
  _: Request,
  response: Response,
  _next: NextFunction
) => {
  response
    .status(error instanceof AppError ? (error.statusCode as number) : 500)
    .json({
      message:
        error instanceof AppError
          ? error.message
          : "Something went wrong. We're not sure what happened.",
    });
};
