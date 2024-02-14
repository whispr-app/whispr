import { AppError } from '@lib/exceptions';
import prisma from '@lib/prisma';
import { Prisma } from '@prisma/client';
import { hashPassword } from 'v0/auth/auth.service';

export const createUser = async (user: Prisma.UserCreateInput) => {
  user.password = await hashPassword(user.password);

  try {
    const record = await prisma.user.create({
      data: user,
      select: {
        id: true,
        nickname: true,
        username: true,
      },
    });

    return record;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new AppError('validation', 'Username already exists');
      }
    }
  }
};

export const updateKeyPair = async (
  userId: string,
  encryptedPrivateKey: string,
  publicKey: string
) => {
  return await prisma.keyPair.create({
    data: {
      encryptedPrivateKey,
      publicKey,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

export const getUser = async (username: string) => {
  return await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      keyPair: true,
    },
  });
};

export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      keyPair: true,
    },
  });
};
