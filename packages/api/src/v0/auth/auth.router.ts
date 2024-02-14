import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import { SigninSchema } from './auth.schema';
import {
  generateAccessToken,
  generateRefreshToken,
  signin,
  signout,
  signoutAll,
} from './auth.controller';
const router = express.Router();

router.post('/sign-in', validate(SigninSchema), signin);
router.post('/sign-out', signout);
router.post('/sign-out-all', signoutAll);

// router.post('/generate-access-token', generateAccessToken);
// router.post('/generate-refresh-token', generateRefreshToken);

export default router;
