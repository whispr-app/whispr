import prisma from '@lib/prisma';
import { connections, notifications } from 'v0/gateway/gateway.service';
import { GatewayServerEvent } from '@whispr/types';

export const checkUserHasPermissions = async (
  userId: string,
  channelId: string
): Promise<false | { read: boolean; write: boolean }> => {
  const userChannelPerms = await prisma.userChannelPermissions.findFirst({
    where: {
      userId,
      channelId,
    },
  });

  if (!userChannelPerms) {
    return false;
  }

  return {
    read: userChannelPerms.canRead,
    write: userChannelPerms.canWrite,
  };
};

export const getChannel = async (channelId: string) => {
  return await prisma.channel.findUnique({
    where: {
      id: channelId,
    },
    include: {
      userChannelPermissions: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
              password: false,
            },
          },
        },
      },
    },
  });
};

export const getChannels = async (userId: string) => {
  return await prisma.channel.findMany({
    where: {
      userChannelPermissions: {
        some: {
          userId,
        },
      },
    },
    include: {
      userChannelPermissions: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
              password: false,
            },
          },
        },
      },
    },
  });
};

export const channelAlreadyExists = async (
  userId: string,
  recipients: string[]
) => {
  const channels = await prisma.channel.findMany({
    where: {
      userChannelPermissions: {
        some: {
          userId,
        },
      },
    },
    include: {
      userChannelPermissions: {
        select: {
          userId: true,
        },
      },
    },
  });

  for (const channel of channels) {
    if (channel.userChannelPermissions.length !== recipients.length + 1) {
      continue;
    }

    channel.userChannelPermissions = channel.userChannelPermissions.filter(
      p => p.userId !== userId
    );

    const recipientIds = recipients.map(r => r);

    for (const permission of channel.userChannelPermissions) {
      if (!permission.userId) continue;
      const index = recipientIds.indexOf(permission.userId);

      if (index === -1) {
        break;
      }

      recipientIds.splice(index, 1);
    }

    if (recipientIds.length === 0) {
      return channel;
    }
  }

  return false;
};

export const createChannel = async (
  userId: string,
  recipients: string[],
  name?: string
) => {
  const channel = await prisma.channel.create({
    data: {
      userChannelPermissions: {
        create: [
          {
            userId,
            canRead: true,
            canWrite: true,
          },
          ...recipients.map(r => ({
            userId: r,
            canRead: true,
            canWrite: true,
          })),
        ],
      },
      name,
    },
    include: {
      userChannelPermissions: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
              password: false,
            },
          },
        },
      },
    },
  });

  notifications.fire(GatewayServerEvent.ChannelCreate, {
    targetIds: [userId, ...recipients],
    data: {
      channel,
    },
  });

  return channel;
};

export const getMessages = async (channelId: string, page: number = 1) => {
  return await prisma.message.findMany({
    where: {
      channelId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: (page - 1) * 50,
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          nickname: true,
          password: false,
          keyPair: {
            select: {
              publicKey: true,
            },
          },
        },
      },
    },
  });
};

export const getMessage = async (messageId: string) => {
  return await prisma.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          nickname: true,
          password: false,
          keyPair: {
            select: {
              publicKey: true,
            },
          },
        },
      },
    },
  });
};

export const getMessageText = async (messageId: string, userId: string) => {
  return await prisma.messageText.findFirst({
    where: {
      messageId,
      targetUserId: userId,
    },
  });
};

export const createMessage = async (
  channelId: string,
  authorId: string,
  content: { cipher: string; target: string; encryptedSymmetricKey: string }[]
) => {
  const message = await prisma.message.create({
    data: {
      userId: authorId,
      channelId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          nickname: true,
          password: false,
          keyPair: {
            select: {
              publicKey: true,
            },
          },
        },
      },
    },
  });

  await prisma.channel.update({
    where: {
      id: channelId,
    },
    data: {
      lastMessageId: message.id,
    },
  });

  for (const { cipher, target, encryptedSymmetricKey } of content) {
    await prisma.messageText.create({
      data: {
        cipherText: cipher,
        messageId: message.id,
        targetUserId: target,
        encryptedSymmetricKey,
      },
    });
  }

  notifications.fire(GatewayServerEvent.MessageCreate, {
    targetIds: [authorId, ...content.map(c => c.target)],
    data: {
      channelId,
      content: [
        await getMessageText(message.id, authorId),
        ...(await Promise.all(
          content.map(async c => {
            return await getMessageText(message.id, c.target);
          })
        )),
      ],
      author: message.user,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      id: message.id,
    },
  });

  return message;
};
