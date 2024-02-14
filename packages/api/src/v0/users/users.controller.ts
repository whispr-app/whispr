import { NextFunction, Request, RequestHandler, Response } from 'express';
import prisma from '@lib/prisma';
import {
  ChannelCreateSchema,
  GetUserByIdSchema,
  GetUserSchema,
  RegisterSchema,
  UpdateKeyPairSchema,
} from './users.schemas';
import * as usersService from './users.service';
import * as channelsService from 'v0/channels/channels.service';
import { AppError } from '@lib/exceptions';
import { generateUserToken } from 'v0/auth/auth.service';

const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

export const register: RequestHandler = async (
  req: Request<unknown, unknown, RegisterSchema>,
  res: Response,
  next: NextFunction
) => {
  const { password, nickname, username } = req.body;

  if (!usernameRegex.test(username)) {
    return next(
      new AppError(
        'validation',
        'Username must be between 3 and 20 characters and can only contain letters, numbers, underscores and hyphens.'
      )
    );
  }

  try {
    const user = await usersService.createUser({
      password,
      nickname,
      username,
    });

    if (!user) {
      return next(new AppError('validation', 'Username already exists'));
    }

    // TODO: Change to refresh once MVP is done
    const token = await generateUserToken(user.id, 'access');

    res.status(201).json({
      id: user.id,
      token,
    });
  } catch (e) {
    if (e instanceof AppError) {
      return next(e);
    }

    return next(new AppError('validation', 'Invalid input'));
  }
};

export const updateKeyPairs = async (
  req: Request<unknown, unknown, UpdateKeyPairSchema>,
  res: Response,
  next: NextFunction
) => {
  const { encryptedPrivateKey, publicKey } = req.body;

  const userId = req.session?.userId;

  if (!userId) return next(new AppError('unauthorised', 'No user ID provided'));

  const exitingKeyPair = await prisma.keyPair.findFirst({
    where: {
      userId,
    },
  });

  if (exitingKeyPair)
    return next(
      new AppError(
        'validation',
        'Specified user has already established key pair.'
      )
    );

  await usersService.updateKeyPair(userId, encryptedPrivateKey, publicKey);

  res.status(200).send();
};

export const getUser: RequestHandler<GetUserSchema> = async (
  req: Request<GetUserSchema>,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params;
  const user = await (async () => {
    if (username === '@self') {
      if (!req.session?.userId) {
        return next(
          new AppError('unauthorised', 'No user ID provided in session')
        );
      }
      return await usersService.getUserById(req.session?.userId);
    } else {
      return await usersService.getUser(username);
    }
  })();

  if (!user) {
    return next(new AppError('validation', 'Specified user was not found.'));
  }

  const sessionUserId = req.session?.userId;

  res.status(200).json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    publicKey: user.keyPair?.publicKey,
    encryptedPrivateKey:
      sessionUserId === user.id ? user.keyPair?.encryptedPrivateKey : null,
  });
};

export const getUserById: RequestHandler<GetUserByIdSchema> = async (
  req: Request<GetUserByIdSchema>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  const user = await usersService.getUserById(userId);

  if (!user) {
    return next(new AppError('validation', 'Specified user was not found.'));
  }

  const sessionUserId = req.session?.userId;

  res.status(200).json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    publicKey: user.keyPair?.publicKey,
    encryptedPrivateKey:
      sessionUserId === user.id ? user.keyPair?.encryptedPrivateKey : null,
  });
};

export const getUserPasswordSalt: RequestHandler<GetUserSchema> = async (
  req: Request<GetUserSchema>,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params;

  const user = await usersService.getUser(username);

  if (!user) {
    return next(new AppError('validation', 'Specified user was not found.'));
  }

  res.status(200).json({
    salt: user.password.split(':')[1],
  });
};

export const getChannels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.session?.userId;

  if (!userId) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const channels = await channelsService.getChannels(userId);

  res.status(200).json(channels);
};

export const createChannel = async (
  req: Request<unknown, unknown, ChannelCreateSchema>,
  res: Response,
  next: NextFunction
) => {
  const { recipients, name } = req.body;

  const userId = req.session?.userId;

  if (!userId) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  if (recipients.includes(userId)) {
    return next(new AppError('validation', 'Cannot include self as recipient'));
  }

  const exists = await channelsService.channelAlreadyExists(userId, recipients);

  if (exists) {
    return next(new AppError('validation', 'Channel already exists'));
  }

  const channel = await channelsService.createChannel(userId, recipients, name);

  res.status(201).json(channel);
};
