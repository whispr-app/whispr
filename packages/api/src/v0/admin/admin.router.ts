import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import {
  banUser,
  deleteKey,
  fetchKeys,
  generateKeys,
  isAuthorised,
  unbanUser,
} from './admin.controller';
import { GenerateKeysSchema } from './admin.schema';

const router = express.Router();

router.get('/is-authorised', isAuthorised);
router.post('/generate-keys', validate(GenerateKeysSchema), generateKeys);
router.get('/fetch-keys', fetchKeys);
router.delete('/delete-key/:key', deleteKey);

router.post('/ban-user/:username', banUser);
router.post('/unban-user/:username', unbanUser);

export default router;
