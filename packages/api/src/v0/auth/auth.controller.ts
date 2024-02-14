import { NextFunction, Request, RequestHandler, Response } from 'express';
import { SigninSchema } from './auth.schema';
import prisma from '@lib/prisma';
import { AppError } from '@lib/exceptions';
import { generateUserToken, isPasswordValid } from './auth.service';
import { getUser } from 'v0/users/users.service';
import { verifyToken } from '@lib/tokens';

export const signin: RequestHandler = async (
  req: Request<unknown, unknown, SigninSchema>,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  const user = await getUser(username);

  if (!user) {
    return next(new AppError('validation', 'User not found'));
  }

  const passwordValid = await isPasswordValid(password, user.password);

  if (!passwordValid) {
    return next(new AppError('validation', 'Incorrect password'));
  }

  // TODO: Change to refresh once MVP is done
  const token = await generateUserToken(user.id, 'access');

  res.status(200).json({
    id: user.id,
    nickname: user.nickname,
    token,
    publicKey: user.keyPair?.publicKey,
    encryptedPrivateKey: user.keyPair?.encryptedPrivateKey,
  });
};

export const signout: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('signout');

  if (!req.session) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const token = await verifyToken(req.session.token);

  try {
    await prisma.token.delete({
      where: {
        jti: token.payload.jti,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }

  res.status(200).send();
};

export const signoutAll: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  try {
    await prisma.token.deleteMany({
      where: {
        userId: req.session.userId,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }

  res.status(200).send();
};

export const generateAccessToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const token = await generateUserToken(req.session.userId, 'access');

  res.status(200).json({ token });
};

export const generateRefreshToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const token = await generateUserToken(req.session.userId, 'refresh');

  res.status(200).json({ token });
};
