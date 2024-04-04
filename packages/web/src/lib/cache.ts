class CacheValue {
	public value: unknown;
	public expires: number;
	constructor(value: unknown, ttl: number) {
		this.value = value;
		this.expires = Date.now() + ttl;
	}
}

export default class Cache {
	private cache: Map<string, CacheValue> = new Map();
	private ttl: number;
	private interval: NodeJS.Timeout;

	constructor(ttl: number) {
		this.ttl = ttl;
		this.interval = setInterval(() => {
			this.clearExpired();
		}, this.ttl);
	}

	get size(): number {
		return this.cache.size;
	}

	get values(): CacheValue[] {
		return Array.from(this.cache.values());
	}

	public has(key: string): boolean {
		return this.cache.has(key);
	}

	public get(key: string): unknown | null {
		const value = this.cache.get(key);
		if (value) {
			return value.value;
		}
		return null;
	}

	public set(key: string, value: unknown): void {
		this.cache.set(key, new CacheValue(value, this.ttl));
	}

	public remove(key: string): void {
		this.cache.delete(key);
	}

	public clear(): void {
		this.cache.clear();
	}

	private clearExpired(): void {
		const now = Date.now();
		for (const [key, value] of this.cache.entries()) {
			if (value.expires < now) {
				this.cache.delete(key);
			}
		}
	}
}
