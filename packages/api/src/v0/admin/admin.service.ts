import { AppError } from '@lib/exceptions';
import prisma from '@lib/prisma';
import { randomUUID } from 'crypto';

export const getUserRole = async (userId: string) => {
  const user = await prisma.user
    .findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    })
    .catch(() => {
      return;
    });

  return user?.role;
};

export const generateKey = async (numberOfUses: number) => {
  const key = randomUUID();

  await prisma.accessKey.create({
    data: {
      key,
      numberOfUses,
    },
  });

  return key;
};

export const redeemKey = async (key: string) => {
  const keyRecord = await prisma.accessKey.findUnique({
    where: {
      key,
    },
  });

  if (!keyRecord) {
    throw new AppError('validation', 'Key not found');
  }

  if (keyRecord.numberOfUses === 0) {
    throw new AppError('validation', 'Key has no uses remaining');
  }

  return await prisma.accessKey.update({
    where: {
      key,
    },
    data: {
      numberOfUses: {
        decrement: 1,
      },
    },
  });
};

export const unredeemKey = async (key: string) => {
  const keyRecord = await prisma.accessKey.findUnique({
    where: {
      key,
    },
  });

  if (!keyRecord) {
    throw new AppError('validation', 'Key not found');
  }

  return await prisma.accessKey.update({
    where: {
      key,
    },
    data: {
      numberOfUses: {
        increment: 1,
      },
    },
  });
};
