import express from 'express';
import { validate, validateWs } from '@lib/middleware';
import { gateway } from './gateway.controller';
import expressWs from 'express-ws';
const { app: router } = expressWs(express());

router.ws('/:token', gateway);

export default router;
