import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import {
  GetChannelSchema,
  GetMessageSchema,
  GetMessagesSchema,
  MessagePostSchema,
} from './channels.schema';
import {
  getChannel,
  getMessage,
  getMessages,
  postMessage,
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

export default router;
