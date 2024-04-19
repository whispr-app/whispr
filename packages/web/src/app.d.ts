// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	declare const PKG: {
		name: string;
		version: string;
	};

	declare const GIT_HASH: {
		full: string;
		short: string;
	};
}

export {};
