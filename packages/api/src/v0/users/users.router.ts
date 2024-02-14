import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import {
  ChannelCreateSchema,
  GetUserByIdSchema,
  GetUserSchema,
  RegisterSchema,
  UpdateKeyPairSchema,
} from './users.schemas';
import {
  createChannel,
  getChannels,
  getUser,
  getUserById,
  getUserPasswordSalt,
  register,
  updateKeyPairs,
} from './users.controller';
const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.patch('/update-key-pair', validate(UpdateKeyPairSchema), updateKeyPairs);
router.get('/get-user/:username', validate(GetUserSchema), getUser);
router.get('/get-user-by-id/:userId', validate(GetUserByIdSchema), getUserById);
router.get(
  '/get-user-password-salt/:username',
  validate(GetUserSchema),
  getUserPasswordSalt
);
router.get('/@self/channels', getChannels);
router.post('/@self/channels', validate(ChannelCreateSchema), createChannel);

export default router;
