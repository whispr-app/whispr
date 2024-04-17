import { AppError } from '@lib/exceptions';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { getUserRole, generateKey } from './admin.service';
import prisma from '@lib/prisma';

export const isAuthorised = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = req.session;

  if (!session) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const role = await getUserRole(session.userId);

  if (!role) {
    return next(new AppError('unauthorised', 'User not found'));
  }

  if (role !== 'ADMIN') {
    return next(new AppError('unauthorised', 'User is not an admin'));
  }

  res.status(200).send();
};

export const generateKeys = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = req.session;

  if (!session) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const role = await getUserRole(session.userId);

  if (!role) {
    return next(new AppError('unauthorised', 'User not found'));
  }

  if (role !== 'ADMIN') {
    return next(new AppError('unauthorised', 'User is not an admin'));
  }

  const { keys, numberOfUses } = req.body;

  if (!keys) {
    return next(new AppError('validation', 'Keys are required'));
  }

  const keysArray: string[] = [];
  for (let i = 0; i < keys; i++) {
    keysArray.push(await generateKey(numberOfUses));
  }

  res.status(200).send({ keys: keysArray });
};

export const fetchKeys = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = req.session;

  if (!session) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const role = await getUserRole(session.userId);

  if (!role) {
    return next(new AppError('unauthorised', 'User not found'));
  }

  if (role !== 'ADMIN') {
    return next(new AppError('unauthorised', 'User is not an admin'));
  }

  const keys = await prisma.accessKey.findMany({
    select: {
      key: true,
      numberOfUses: true,
      createdAt: true,
      users: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  res.status(200).send({ keys });
};

export const deleteKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = req.session;

  if (!session) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const role = await getUserRole(session.userId);

  if (!role) {
    return next(new AppError('unauthorised', 'User not found'));
  }

  if (role !== 'ADMIN') {
    return next(new AppError('unauthorised', 'User is not an admin'));
  }

  const { key } = req.params;

  if (!key) {
    return next(new AppError('validation', 'Key is required'));
  }

  await prisma.accessKey.delete({ where: { key } });

  res.status(200).send();
};
