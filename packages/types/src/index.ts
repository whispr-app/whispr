export enum OpCode {
	Dispatch = 0,
	Heartbeat = 1,
	HeartbeatAck = 2,
	Hello = 4,
	Notification = 5
}

export enum GatewayCloseCode {
	UnknownError = 4000,
	UnknownOpCode = 4001,
	NotAuthenticated = 4002,
	AuthenticationFailed = 4003,
	AlreadyAuthenticated = 4004,
	SessionTimeOut = 4005,
	UnknownConnection = 4006,
	InvalidPayload = 4007
}

export enum GatewayClientEvent {
	Heartbeat = 'HEARTBEAT'
}

export enum GatewayServerEvent {
	Hello = 'HELLO',
	Close = 'CLOSE',
	MessageCreate = 'MESSAGE_CREATE',
	MessageUpdate = 'MESSAGE_UPDATE',
	MessageDelete = 'MESSAGE_DELETE',
	ChannelCreate = 'CHANNEL_CREATE',
	ChannelUpdate = 'CHANNEL_UPDATE',
	ChannelDelete = 'CHANNEL_DELETE'
}
