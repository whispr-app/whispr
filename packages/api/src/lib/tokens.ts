import * as crypto from 'crypto';
import z from 'zod';
import {
  InvalidTokenOptions,
  InvalidToken,
  CannotRevokeToken,
} from './exceptions';
import prisma from './prisma';

export const privateSigningKey = crypto.randomBytes(256).toString('hex');

export const TokenOptionsSchema = z.object({
  audience: z.string(),
  subject: z.string(),
  expiresIn: z.number(),
  identifier: z.string(),
  type: z.string(),
});

export type TokenOptions = z.infer<typeof TokenOptionsSchema>;

export type TokenHeader = {
  alg: 'HS256';
  typ: 'JWT';
};

export const TokenPayload = z.object({
  iss: z.string(),
  aud: z.string(),
  sub: z.string(),
  exp: z.number(),
  iat: z.number(),
  jti: z.string(),
  ide: z.string(),
  typ: z.string(),
});

export type TokenPayload = z.infer<typeof TokenPayload>;

export const generateToken = async (options: TokenOptions) => {
  try {
    TokenOptionsSchema.parse(options);
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new InvalidTokenOptions();
    }
  }

  const { audience, subject, expiresIn, identifier, type } = options;

  const header: TokenHeader = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload: TokenPayload = {
    iss: 'Whispr',
    aud: audience,
    sub: subject,
    exp: Date.now() + expiresIn,
    iat: Date.now(),
    jti: crypto.randomBytes(16).toString('hex'),
    ide: identifier,
    typ: type,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    'base64url'
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  );

  const signature = crypto
    .createHmac('sha256', privateSigningKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  await prisma.token.create({
    data: {
      jti: payload.jti,
      userId: payload.sub,
    },
  });

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyToken = async (token: string) => {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    const header: TokenHeader = JSON.parse(
      Buffer.from(encodedHeader, 'base64url').toString()
    );
    const payload: TokenPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString()
    );

    const calculatedSignature = crypto
      .createHmac('sha256', privateSigningKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    const tokenExists = await prisma.token.findUnique({
      where: {
        jti: payload.jti,
      },
    });

    if (!tokenExists) {
      throw new InvalidToken('Token does not exist');
    }

    if (signature !== calculatedSignature) {
      throw new InvalidToken('Signature does not match');
    }

    if (payload.exp < Date.now()) {
      try {
        await prisma.token.delete({
          where: {
            jti: payload.jti,
          },
        });
      } catch {}
      throw new InvalidToken('Token has expired');
    }

    return { header, payload };
  } catch {
    throw new InvalidToken('Invalid token');
  }
};

export const revokeToken = async (token: string) => {
  const [_, __, signature] = token.split('.');

  const { payload } = await verifyToken(token);

  try {
    await prisma.token.delete({
      where: {
        jti: payload.jti,
      },
    });
  } catch (e) {
    throw new CannotRevokeToken(payload.jti);
  }

  return signature;
};
