import { NextFunction, Request } from 'express';
import {
  HEARTBEAT_INTERVAL,
  HEARTBEAT_TIMEOUT,
  close,
  connectionInterval,
  connections,
  constructEvent,
  notifications,
} from './gateway.service';
import { GatewayCloseCode, GatewayServerEvent, OpCode } from '@whispr/types';
import { WebsocketRequestHandler } from 'express-ws';
import WebSocket from 'ws';
import { GatewayMessageSchema, GatewaySchema } from './gateway.schema';
import { verifyToken } from '@lib/tokens';
import { ZodError } from 'zod';
import { AppError } from '@lib/exceptions';

export const gateway: WebsocketRequestHandler = async (
  ws: WebSocket,
  req: Request,
  next: NextFunction
) => {
  try {
    await GatewaySchema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const invalids = error.issues.map(issue => issue.path.pop());
      next(
        new AppError(
          'validation',
          `Invalid or missing input${
            invalids.length > 1 ? 's' : ''
          } provided for: ${invalids.join(', ')}`
        )
      );
    } else {
      next(new AppError('validation', 'Invalid input'));
    }
  }

  const { token } = req.params;

  if (!token) {
    return close(ws, GatewayCloseCode.InvalidPayload, 'Invalid payload');
  }

  const valid = await verifyToken(token).catch(() => {
    close(ws, GatewayCloseCode.AuthenticationFailed, 'Invalid token');
  });

  if (!valid) {
    return close(ws, GatewayCloseCode.AuthenticationFailed, 'Invalid token');
  }

  const uuid = crypto.randomUUID();
  connections.set(uuid, {
    uuid,
    userId: valid.payload.sub,
    ws,
    lastHeartbeat: Date.now(),
    identified: false,
  });

  let heartbeatInterval: NodeJS.Timeout;

  heartbeatInterval = setInterval(() => {
    connectionInterval(ws, uuid);
  }, HEARTBEAT_TIMEOUT);

  const unsubscribe = notifications.subscribe((event, data) => {
    const e = event as GatewayServerEvent;
    const d = data as {
      targetIds: string[];
      data: any;
    };
    if (d.targetIds.includes(valid.payload.sub)) {
      ws.send(constructEvent(OpCode.Notification, e, d.data));
    }
  });

  ws.send(
    constructEvent(OpCode.Hello, GatewayServerEvent.Hello, {
      heartbeat_interval: HEARTBEAT_INTERVAL,
      uuid,
    })
  );

  ws.on('message', async (data: string) => {
    const msg = JSON.parse(data);

    try {
      await GatewayMessageSchema.parseAsync(msg);
    } catch {
      return ws.close(GatewayCloseCode.InvalidPayload, 'Invalid payload');
    }

    if (!OpCode[msg.op]) {
      close(ws, GatewayCloseCode.UnknownOpCode, 'Unknown opcode');
    }

    const connection = connections.get(uuid);

    if (!connection) {
      return close(
        ws,
        GatewayCloseCode.UnknownConnection,
        'Unknown connection'
      );
    }

    connection.lastHeartbeat = Date.now();

    clearInterval(heartbeatInterval);

    heartbeatInterval = setInterval(() => {
      connectionInterval(ws, uuid);
    }, HEARTBEAT_TIMEOUT);

    switch (msg.op) {
      case OpCode.Heartbeat: {
        ws.send(constructEvent(OpCode.HeartbeatAck, null));
        break;
      }
    }
  });

  ws.on('close', (code: number, reason: string) => {
    connections.delete(uuid);

    unsubscribe();

    clearInterval(heartbeatInterval);
  });
};
