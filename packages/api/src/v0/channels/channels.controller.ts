import { NextFunction, Request, RequestHandler, Response } from 'express';
import {
  DeleteMessageSchema,
  GetChannelSchema,
  GetMessageSchema,
  GetMessagesSchemaParams,
  GetMessagesSchemaQuery,
  MessagePostSchema,
  MessagePostSchemaBody,
  MessagePostSchemaParams,
  UpdateMessageSchemaBody,
  UpdateMessageSchemaParams,
} from './channels.schema';
import * as channelsService from './channels.service';
import { AppError } from '@lib/exceptions';
import { notifications } from 'v0/gateway/gateway.service';
import { GatewayServerEvent } from '@whispr/types';

export const getChannel = async (
  req: Request<GetChannelSchema>,
  res: Response,
  next: NextFunction
) => {
  const { channelId } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(channelId)) {
    return next(new AppError('validation', 'Invalid channel id'));
  }

  const channel = await channelsService.getChannel(channelId).catch(() => {
    return next(new AppError('validation', 'Channel not found'));
  });

  if (!channel) {
    return next(new AppError('validation', 'Channel not found'));
  }

  res.status(200).json(channel);
};

export const getMessages = async (
  req: Request<
    GetMessagesSchemaParams,
    unknown,
    unknown,
    GetMessagesSchemaQuery
  >,
  res: Response,
  next: NextFunction
) => {
  const { channelId } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(channelId)) {
    return next(new AppError('validation', 'Invalid channel id'));
  }

  const userId = req.session?.userId;

  if (!userId) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const hasAccess = await channelsService.checkUserHasPermissions(
    userId,
    channelId
  );

  console.log(hasAccess);

  if (!hasAccess || !hasAccess.read) {
    return next(new AppError('unauthorised', 'User does not have access'));
  }

  const { page } = req.query;

  const messages = await channelsService.getMessages(
    channelId,
    Number(page || 1)
  );

  const messageTexts = await Promise.all(
    messages.map(async message => {
      return {
        content: await channelsService.getMessageText(message.id, userId),
        author: message.user,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        id: message.id,
      };
    })
  );

  return res.status(200).json(messageTexts);
};

export const getMessage = async (
  req: Request<GetMessageSchema>,
  res: Response,
  next: NextFunction
) => {
  const { channelId, messageId } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(channelId)) {
    return next(new AppError('validation', 'Invalid channel id'));
  }

  const userId = req.session?.userId;

  if (!userId) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const hasAccess = await channelsService.checkUserHasPermissions(
    userId,
    channelId
  );

  if (!hasAccess || !hasAccess.read) {
    return next(new AppError('unauthorised', 'User does not have access'));
  }

  try {
    const message = await channelsService.getMessage(messageId);
    console.log(messageId, message);

    if (!message) {
      return next(new AppError('validation', 'Message not found'));
    }

    return res.status(200).json({
      content: await channelsService.getMessageText(message.id, userId),
      author: message.user,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      id: message.id,
    });
  } catch {
    return next(new AppError('validation', 'Message not found'));
  }
};

export const postMessage: RequestHandler<
  MessagePostSchemaParams,
  unknown,
  MessagePostSchemaBody
> = async (
  req: Request<MessagePostSchemaParams, unknown, MessagePostSchemaBody>,
  res: Response,
  next: NextFunction
) => {
  const { channelId } = req.params;
  const { content } = req.body;

  if (!/^[0-9a-fA-F]{24}$/.test(channelId)) {
    return next(new AppError('validation', 'Invalid channel id'));
  }

  const userId = req.session?.userId;

  if (!userId) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const hasAccess = await channelsService.checkUserHasPermissions(
    userId,
    channelId
  );

  console.log(hasAccess);

  if (!hasAccess || !hasAccess.write) {
    return next(new AppError('unauthorised', 'User does not have access'));
  }

  const message = await channelsService.createMessage(
    channelId,
    userId,
    content
  );

  return res.status(201).json({
    id: message.id,
    createdAt: message.createdAt,
  });
};

export const updateMessage: RequestHandler<
  UpdateMessageSchemaParams,
  unknown,
  UpdateMessageSchemaBody
> = async (
  req: Request<UpdateMessageSchemaParams, unknown, UpdateMessageSchemaBody>,
  res: Response,
  next: NextFunction
) => {
  const { channelId, messageId } = req.params;
  const { content } = req.body;

  if (!/^[0-9a-fA-F]{24}$/.test(channelId)) {
    return next(new AppError('validation', 'Invalid channel id'));
  }

  const userId = req.session?.userId;

  if (!userId) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const hasAccess = await channelsService.checkUserHasPermissions(
    userId,
    channelId
  );

  if (!hasAccess || !hasAccess.write) {
    return next(new AppError('unauthorised', 'User does not have access'));
  }

  const message = await channelsService.updateMessage(messageId, content);

  if (!message) {
    return next(new AppError('validation', 'Message not found'));
  }

  return res.status(200).json({
    id: message.id,
    updatedAt: message.edited,
  });
};

export const deleteMessage: RequestHandler<DeleteMessageSchema> = async (
  req: Request<DeleteMessageSchema>,
  res: Response,
  next: NextFunction
) => {
  const { channelId, messageId } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(channelId)) {
    return next(new AppError('validation', 'Invalid channel id'));
  }

  const userId = req.session?.userId;

  if (!userId) {
    return next(new AppError('unauthorised', 'No session found'));
  }

  const message = await channelsService.getMessage(messageId);

  if (!message) {
    return next(new AppError('validation', 'Message not found'));
  }

  if (message.userId !== userId) {
    return next(new AppError('unauthorised', 'User does not have permission'));
  }

  await channelsService.deleteMessage(messageId);

  return res.status(204).json();
};
