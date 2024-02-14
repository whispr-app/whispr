import Event from '@lib/event';
import { GatewayMessageSchema } from './gateway.schema';
import { GatewayCloseCode, GatewayServerEvent, OpCode } from '@whispr/types';
import WebSocket from 'ws';

export const HEARTBEAT_INTERVAL = 25_000;
export const HEARTBEAT_TIMEOUT = 60_000;

type Connection = {
  uuid: string;
  userId: string;
  ws: WebSocket;
  lastHeartbeat: number;
  identified: boolean;
};

export const connections = new Map<string, Connection>();

export const notifications = new Event();

export const connectionInterval = (ws: WebSocket, uuid: string) => {
  const connection = connections.get(uuid);

  if (!connection) {
    return close(ws, GatewayCloseCode.UnknownConnection, 'Unknown connection');
  }

  if (Date.now() - connection.lastHeartbeat > HEARTBEAT_INTERVAL) {
    return close(ws, GatewayCloseCode.SessionTimeOut, 'Session timed out');
  }
};

export const constructEvent = (opcode: OpCode, ...data: any[]) => {
  let type = null;
  if (data.length > 1) {
    type = data[0];
    data = data.slice(1);
  }
  const payload: GatewayMessageSchema = {
    op: opcode,
    ts: Date.now(),
  };

  if (type) payload['t'] = type;
  if (data[0] !== null) payload['d'] = data[0];

  return JSON.stringify(payload);
};

export const close = (
  ws: WebSocket,
  code: GatewayCloseCode,
  reason: string
) => {
  ws.send(
    constructEvent(OpCode.Dispatch, GatewayServerEvent.Close, {
      code,
      reason,
    })
  );
  ws.close(code, reason);
};
