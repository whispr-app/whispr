import { writable, type Writable } from 'svelte/store';
import { OpCode } from '@whispr/types';
import { libWhispr } from './libWhispr';
import { browser } from '$app/environment';

const baseReconnectionSeconds = 5;

export class GatewayManager {
	private gateway: Gateway;
	constructor(gateway: Gateway) {
		this.gateway = gateway;

		this.gateway.establishConnection();
		setInterval(() => {
			if (!this.gateway.open) this.gateway.establishConnection();
		}, baseReconnectionSeconds * 1000);
	}
}

export class Gateway {
	public socket: WebSocket | null = null;
	public open: boolean = false;
	public stream: MessageEvent[] = [];
	public uuid: string = '';
	public streamWritable: Writable<MessageEvent[]> = writable(this.stream);
	private heartbeatInterval: NodeJS.Timeout | null = null;
	constructor() {}
	public establishConnection = () => {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
			this.uuid = '';
		}
		if (!libWhispr.authStore?.token) return;
		this.socket =
			(browser &&
				new WebSocket(libWhispr.constructWsUrl(`gateway/${libWhispr.authStore?.token}`))) ||
			null;

		this.socket!.onopen = () => {
			this.open = true;
		};

		this.socket!.onclose = () => {
			this.open = false;
			this.stream.unshift(
				new MessageEvent('message', {
					data: JSON.stringify({ ts: new Date(), d: { code: 1000, reason: 'closed' } })
				})
			);
			this.streamWritable.set(this.stream);

			// setTimeout(async () => {
			// 	console.log('reconnecting');

			// 	this.establishConnection();
			// 	await new Promise((resolve) => setTimeout(resolve, 5000));
			// 	console.log('open:', this.open);

			// 	if (!this.open) {
			// 		console.log('new timeout', Math.max(this.reconnectionAttemptSeconds * 2, 60));

			// 		this.reconnectionAttemptSeconds = Math.max(this.reconnectionAttemptSeconds * 2, 60);
			// 	}
			// }, baseReconnectionSeconds + this.reconnectionAttemptSeconds);
		};

		this.socket!.onmessage = async (msg) => {
			if (!this.socket) return;

			this.stream.unshift(msg);
			this.streamWritable.set(this.stream);

			const { op, d } = JSON.parse(msg.data);

			switch (op) {
				case OpCode.Hello: {
					this.uuid = d.uuid;
					if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
					this.heartbeatInterval = setInterval(() => {
						if (!this.open && this.heartbeatInterval) return clearInterval(this.heartbeatInterval);
						if (!this.socket) return;
						this.socket.send(
							JSON.stringify({
								op: OpCode.Heartbeat,
								ts: Date.now()
							})
						);
					}, d.heartbeat_interval);
					break;
				}
				case OpCode.Dispatch: {
					break;
				}
			}
		};
	};
}

export const gateway = new Gateway();
export const gatewayManager = new GatewayManager(gateway);
