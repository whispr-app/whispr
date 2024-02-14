// Imports
import express, { Router } from 'express';
import expressWs from 'express-ws';
import { NextFunction, Request, Response } from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';
import responseTime from 'response-time';
import { port, domain, version, skipDomainCheck } from '@lib/argvHandler';
import { authorisation, errorHandler } from './middleware';
import { hash } from '@lib/getCommitHash';
import paths from '@whispr/web';
import { env } from '@lib/env';
import mimeTypes from 'mime-types';

// Environment
const path = env === 'prod' ? '/api' : '';

// Exceptions
import { DomainNotSpecified, NotValidVersion } from './exceptions';

// Argument values
if (!domain && env === 'prod' && !skipDomainCheck)
  throw new DomainNotSpecified();
if (!version || (version && !version.match(/^(\d+\.)?(\d+\.)?(\*|\d+)$/)))
  throw new NotValidVersion(version || 'undefined');

// Express
export const { app, applyTo, getWss } = expressWs(express());

if (env === 'dev') {
  app.use(
    responseTime((req: Request, res: Response, time) => {
      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${time.toFixed(
          2
        )}ms`
      );
    })
  );
}

app.use(bodyparser.json());
app.use(
  cors({
    origin: '*',
  })
);

app.use(`${path}/`, async (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('content-type', 'application/json');
  next();
});

// Is-Alive
app.get(`${path}/`, (req: Request, res: Response) => {
  res.status(200).json({
    'is-alive': true,
    'domain': domain,
    'port': port,
    'env': env,
    'version': version,
    'commit-hash': hash,
  });
});

// Routing
import v0 from 'v0/index';

app.use(`${path}/v0`, v0);

if (env !== 'dev') {
  // todo: refactor this into a single function call for both 404 and non-404 :)
  for (const [path, data] of Object.entries(paths)) {
    const mimeType = data[0];
    const buffer = Buffer.from(data[1], 'base64');
    const contentType = mimeTypes.contentType(mimeType);
    app.get(`/${path.replace(/(index)?.html/, '')}`, (_req, res) =>
      res.setHeader('content-type', contentType || mimeType).send(buffer)
    );
  }
  const _404Data = paths['404.html'];
  const _404MimeType = _404Data[0];
  const _404Buf = Buffer.from(_404Data[1], 'base64');
  const _404ContentType = mimeTypes.contentType(_404MimeType);
  app.get('/', (_req, res) =>
    res.setHeader('content-type', _404ContentType || _404MimeType).send(_404Buf)
  );
}

app.use(errorHandler);
