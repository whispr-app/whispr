import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import { generateKeys, isAuthorised } from './admin.controller';
import { GenerateKeysSchema } from './admin.schema';

const router = express.Router();

router.get('/is-authorised', isAuthorised);
router.post('/generate-keys', validate(GenerateKeysSchema), generateKeys);

export default router;
