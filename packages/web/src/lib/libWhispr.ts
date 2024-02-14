import * as openpgp from 'openpgp';
import axios from 'axios';

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const url = import.meta.env.DEV ? 'localhost:28980' : 'whispr.cx/api';

console.log('api url', url);

export type LibWhisprOptions = {
	version: string;
	secure: boolean;
};

export type AuthStore = {
	token: string;
	userId: string;
	username: string;
	privateKey: string;
	publicKey: string;
};

export class LibWhispr {
	private connectionUrl: string;
	private options: LibWhisprOptions;
	public authStore: AuthStore | null = JSON.parse(
		(browser && localStorage.getItem('authedUser')) || 'null'
	);

	constructor(connectionUrl: string, options: LibWhisprOptions) {
		this.connectionUrl = connectionUrl;
		this.options = options;
	}

	public constructHttpUrl = (path: string) => {
		return `http${this.options.secure ? 's' : ''}://${this.connectionUrl}/${
			this.options.version
		}/${path}`;
	};

	public constructWsUrl = (path: string) => {
		return `ws${this.options.secure ? 's' : ''}://${this.connectionUrl}/${
			this.options.version
		}/${path}`;
	};

	public updateConnectionUrl = (connectionUrl: string) => {
		this.connectionUrl = connectionUrl;
	};

	public register = async (password: string, nickname: string, username: string) => {
		const saltPwd = this.generateSalt();
		const saltStringPwd = btoa(String.fromCharCode(...new Uint8Array(saltPwd)));
		const hashedPassword = await this.pbkdf2(password, saltPwd);
		const hashedPasswordString = (await window.crypto.subtle.exportKey('jwk', hashedPassword)).k!;

		const response = await axios.post(this.constructHttpUrl('users/register'), {
			password: `${hashedPasswordString}:${saltStringPwd}`,
			nickname,
			username
		});
		const { token, id } = response.data;

		const { privateKey, publicKey } = await this.generateAsymmetricKeyPair(id);
		const saltPrk = this.generateSalt();
		const saltStringPrk = btoa(String.fromCharCode(...new Uint8Array(saltPrk)));
		const iv = this.generateIv();
		const ivString = btoa(String.fromCharCode(...new Uint8Array(iv)));
		const prkHashedPassword = await this.pbkdf2(password, saltPrk);
		const encryptedPrivateKey = btoa(
			String.fromCharCode(
				...new Uint8Array(await libWhispr.encryptMessage(privateKey, prkHashedPassword, iv))
			)
		);
		await axios.patch(
			this.constructHttpUrl('users/update-key-pair'),
			{
				encryptedPrivateKey: `${encryptedPrivateKey}:${saltStringPrk}:${ivString}`,
				publicKey
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		this.authStore = {
			token,
			userId: id,
			username,
			privateKey,
			publicKey
		};
		authedUser.set(this.authStore);

		return response;
	};

	public signin = async (username: string, password: string) => {
		const { data } = await axios.get(
			this.constructHttpUrl(`users/get-user-password-salt/${username}`)
		);

		const { salt } = data;

		const saltBuffer = new Uint8Array(
			atob(salt)
				.split('')
				.map((c) => c.charCodeAt(0))
		);

		const hashedPassword = await this.pbkdf2(password, saltBuffer);

		const hashedPasswordString = (await window.crypto.subtle.exportKey('jwk', hashedPassword)).k!;

		const response = await axios.post(this.constructHttpUrl('auth/sign-in'), {
			username,
			password: `${hashedPasswordString}:${salt}`
		});

		const { token, id: userId, encryptedPrivateKey, publicKey } = response.data;

		this.authStore = {
			token,
			userId,
			username,
			publicKey,
			privateKey: await this.deriveEncryptedPrivateKey(password, encryptedPrivateKey)
		};

		authedUser.set(this.authStore);

		return response;
	};

	public signout = async () => {
		if (!this.authStore) throw new Error('Not signed in');

		const response = await axios.post(this.constructHttpUrl('auth/sign-out'));

		if (response.status !== 200) throw new Error('Failed to sign out');

		this.authStore = null;
		authedUser.set(null);
	};

	public getUser = async (username: string) => {
		const response = await axios.get(this.constructHttpUrl(`users/get-user/${username}`));

		return response.data;
	};

	public getChannels = async () => {
		const response = await axios.get(this.constructHttpUrl('users/@self/channels'));

		return response.data;
	};

	public getChannel = async (channelId: string) => {
		const response = await axios.get(this.constructHttpUrl(`channels/${channelId}`));

		return response.data;
	};

	public createChannel = async (recipients: string[]) => {
		const response = await axios.post(this.constructHttpUrl(`/users/@self/channels`), {
			recipients
		});

		return response.data;
	};

	public getMessage = async (channelId: string, messageId: string) => {
		const response = await axios.get(
			this.constructHttpUrl(`channels/${channelId}/messages/${messageId}`)
		);

		return response.data;
	};

	public fetchMessages = async (channelId: string, page: number = 1) => {
		const response = await axios.get(
			this.constructHttpUrl(`channels/${channelId}/messages?page=${page}`)
		);

		return response.data;
	};

	public bufferToBase64 = (buffer: ArrayBuffer) => {
		return btoa(
			new Uint8Array(buffer).reduce((binary, byte) => binary + String.fromCharCode(byte), '')
		);
	};

	public base64ToBuffer = (base64: string) => {
		return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
	};

	public prepareMessage = async (
		symmetricKey: CryptoKey,
		privateKey: string,
		publicKey: string,
		content: string
	): Promise<{
		cipher: string;
		encryptedSymmetricKey: string;
	}> => {
		const encryptedSymmetricKey = await this.encryptSymmetricKey(
			symmetricKey,
			publicKey,
			privateKey
		);

		const iv = this.generateIv();
		const ivString = btoa(String.fromCharCode(...new Uint8Array(iv)));
		const encryptedContent = await this.encryptMessage(content, symmetricKey, iv);

		const encryptedContentString = this.bufferToBase64(encryptedContent);

		return {
			cipher: `${encryptedContentString}:${ivString}`,
			encryptedSymmetricKey
		};
	};

	public sendMessage = async (channelId: string, content: string) => {
		const channel = await this.getChannel(channelId);

		const user = await this.getUser(
			channel.userChannelPermissions.find(
				(r: {
					user: {
						id: string;
						username: string;
						nickname: string;
					};
				}) => r.user.id !== this.authStore!.userId
			)!.user.username
		);

		const symmetricKey = await this.generateSymmetricKey();

		await axios.post(this.constructHttpUrl(`channels/${channelId}/messages`), {
			content: [
				{
					target: user.id,
					...(await this.prepareMessage(
						symmetricKey,
						this.authStore!.privateKey,
						user.publicKey,
						content
					))
				},
				{
					target: this.authStore!.userId,
					...(await this.prepareMessage(
						symmetricKey,
						this.authStore!.privateKey,
						this.authStore!.publicKey,
						content
					))
				}
			]
		});
	};

	public decryptMessageContent = async (
		cipher: string,
		author: {
			id: string;
			username: string;
			nickname: string;
			keyPair: {
				publicKey: string;
			};
		},
		encryptedSymmetricKey: string
	): Promise<string> => {
		const [encryptedContent, iv] = cipher.split(':');
		const symmetricKey = await this.deriveSymmetricKey(
			encryptedSymmetricKey,
			author.keyPair.publicKey,
			this.authStore!.privateKey
		);
		const ivBuffer = new Uint8Array(
			atob(iv)
				.split('')
				.map((c) => c.charCodeAt(0))
		);
		const decryptedContent = await libWhispr.decryptMessage(
			encryptedContent,
			symmetricKey,
			ivBuffer
		);
		return decryptedContent;
	};

	public getSymmetricKey = async (channelId: string) => {
		const response = await axios.get(this.constructHttpUrl(`channels/${channelId}/symmetric-key`));

		return response.data;
	};

	public deriveEncryptedPrivateKey = async (
		password: string,
		encryptedPrivateKey: string
	): Promise<string> => {
		const [encryptedPrivateKeyString, salt, iv] = encryptedPrivateKey.split(':');

		const ivBuffer = new Uint8Array(
			atob(iv)
				.split('')
				.map((c) => c.charCodeAt(0))
		);
		const saltBuffer = new Uint8Array(
			atob(salt)
				.split('')
				.map((c) => c.charCodeAt(0))
		);
		const prkHashedPassword = await this.pbkdf2(password, saltBuffer);
		const derivedPrivateKey = await libWhispr.decryptMessage(
			encryptedPrivateKeyString,
			prkHashedPassword,
			ivBuffer
		);

		return derivedPrivateKey;
	};

	public generateAsymmetricKeyPair = async (
		id: string
	): Promise<openpgp.SerializedKeyPair<string> & { revocationCertificate: string }> => {
		return await openpgp.generateKey({
			type: 'ecc',
			curve: 'curve25519',
			userIDs: [{ name: id, email: '' }],
			format: 'armored'
		});
	};

	public generateSymmetricKey = async (): Promise<CryptoKey> => {
		return (await window.crypto.subtle.generateKey(
			{
				name: 'AES-GCM',
				length: 256
			},
			true,
			['encrypt', 'decrypt']
		)) as CryptoKey;
	};

	public generateIv = (): Uint8Array => {
		return window.crypto.getRandomValues(new Uint8Array(12));
	};

	public generateSalt = (): Uint8Array => {
		return window.crypto.getRandomValues(new Uint8Array(16));
	};

	public encryptSymmetricKey = async (
		symmetricKey: CryptoKey,
		publicKey: string,
		privateKey: string
	): Promise<string> => {
		return await openpgp.encrypt({
			message: await openpgp.createMessage({
				text: btoa(
					String.fromCharCode(
						...new Uint8Array(await window.crypto.subtle.exportKey('raw', symmetricKey))
					)
				)
			}),
			encryptionKeys: await openpgp.readKey({ armoredKey: publicKey }),
			signingKeys: await openpgp.readPrivateKey({ armoredKey: privateKey })
		});
	};

	public deriveSymmetricKey = async (
		encryptedKey: string,
		publicKey: string,
		privateKey: string
	): Promise<CryptoKey> => {
		const { data: decryptedKey } = await openpgp.decrypt({
			message: await openpgp.readMessage({ armoredMessage: encryptedKey }),
			verificationKeys: await openpgp.readKey({ armoredKey: publicKey }),
			decryptionKeys: await openpgp.readPrivateKey({ armoredKey: privateKey })
		});

		const binaryStr = atob(decryptedKey);
		const bytes = new Uint8Array(binaryStr.length);
		for (let i = 0; i < binaryStr.length; i++) {
			bytes[i] = binaryStr.charCodeAt(i);
		}

		return await window.crypto.subtle.importKey('raw', bytes.buffer, 'AES-GCM', true, [
			'encrypt',
			'decrypt'
		]);
	};

	public encryptMessage = async (
		content: string,
		key: CryptoKey,
		iv: Uint8Array
	): Promise<ArrayBuffer> => {
		return await window.crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv
			},
			key,
			new TextEncoder().encode(content)
		);
	};

	public decryptMessage = async (
		content: ArrayBuffer | string,
		key: CryptoKey,
		iv: Uint8Array
	): Promise<string> => {
		if (typeof content === 'string') {
			content = Uint8Array.from(atob(content), (c) => c.charCodeAt(0));
		}

		return new TextDecoder().decode(
			await window.crypto.subtle.decrypt(
				{
					name: 'AES-GCM',
					iv
				},
				key,
				content
			)
		);
	};

	public pbkdf2 = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
		const keyMaterial = await window.crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(password),
			'PBKDF2',
			false,
			['deriveKey']
		);

		const key = await window.crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 210000,
				hash: 'SHA-256'
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			true,
			['encrypt', 'decrypt']
		);

		return key;
	};
}

export const libWhispr = new LibWhispr(url, {
	version: 'v0',
	secure: import.meta.env.PROD
});

export const authedUser = writable<AuthStore | null>(
	JSON.parse((browser && localStorage.getItem('authedUser')) || 'null')
);

authedUser.subscribe((value) => {
	browser && localStorage.setItem('authedUser', JSON.stringify(value));
});
