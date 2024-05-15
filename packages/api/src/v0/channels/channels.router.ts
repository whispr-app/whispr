import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import {
  DeleteMessageSchema,
  GetChannelSchema,
  GetMessageSchema,
  GetMessagesSchema,
  MessagePostSchema,
  UpdateMessageSchema,
} from './channels.schema';
import {
  deleteMessage,
  getChannel,
  getMessage,
  getMessages,
  postMessage,
  updateMessage,
} from './channels.controller';
const router = express.Router();

router.get('/:channelId', validate(GetChannelSchema), getChannel);
router.get('/:channelId/messages', validate(GetMessagesSchema), getMessages);
router.get(
  '/:channelId/messages/:messageId',
  validate(GetMessageSchema),
  getMessage
);
router.post('/:channelId/messages', validate(MessagePostSchema), postMessage);
router.patch(
  '/:channelId/messages/:messageId',
  validate(UpdateMessageSchema),
  updateMessage
);
router.delete(
  '/:channelId/messages/:messageId',
  validate(DeleteMessageSchema),
  deleteMessage
);

export default router;
