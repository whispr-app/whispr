import Cache from './cache';

export default class ChannelCache {
	private channels: Map<string, Cache> = new Map();

	constructor(private ttl: number) {}

	public createCache(channel: string): Cache {
		const cache = new Cache(this.ttl);
		this.channels.set(channel, cache);
		return cache;
	}

	public getCache(channel: string): Cache {
		const cache = this.channels.get(channel);
		if (!cache) {
			return this.createCache(channel);
		}
		return cache;
	}
}
