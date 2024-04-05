<script lang="ts">
	import { page } from '$app/stores';
	import { libWhispr, authedUser } from '$lib/libWhispr.js';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { gateway } from '$lib/gateway';
	import { onDestroy, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { GatewayServerEvent, OpCode } from '@whispr/types';
	import Input from '$lib/components/Input.svelte';
	import Message from '$lib/components/Message.svelte';
	import MockText from '$lib/components/MockText.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Settings from '$lib/components/Settings.svelte';

	$: mobile = navigator.userAgent.match(/Mobi/);

	let chatElement: HTMLElement | null = null;

	let chatSearchString = '';

	const emojiRegex =
		/^(?:\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/g;

	if (!$authedUser) {
		browser && goto(`/login?returnTo=${window.location.pathname}`);
	}

	export let data;

	let mounted = false;
	onMount(() => {
		mounted = true;
	});
	onDestroy(() => {
		mounted = false;
	});

	$: id = data.slug;

	const getLastMessageContent = async (channelId: string, messageId: string) => {
		const msg = await libWhispr.getMessage(channelId, messageId);
		const content = await libWhispr.decryptMessageContent(
			msg.content.cipherText,
			msg.author,
			msg.content.encryptedSymmetricKey
		);

		if (content) msg.content = content;
		return msg;
	};

	const getUserFromUsers = (
		users: {
			user: {
				id: string;
				username: string;
				nickname: string;
			};
		}[]
	) => {
		return users.find((user) => user.user.id !== $authedUser?.userId)?.user;
	};

	// create channel dialog
	let createChannelModalOpen: boolean = false;
	let createChannelUsername = '';

	let createChannelError = '';

	const createChannel = async () => {
		if (!createChannelUsername) return;
		const user = await libWhispr.getUser(createChannelUsername).catch((e) => {
			console.log(e.response.data.message);

			createChannelError = e.response.data.message;
			console.log(createChannelError);

			return;
		});

		if (!user) return;

		const response = await libWhispr.createChannel([user.id]).catch((e) => {
			createChannelError = e.response.data.message;
			return;
		});

		console.log(response);

		if (response) {
			goto(`/channels/${response.id}`);
		}

		createChannelModalOpen = false;
		createChannelUsername = '';
		createChannelError = '';

		// window.location.reload();
	};

	// Channels
	type Channel = {
		id: string;
		name: string | null;
		lastMessageId: string | null;
		userChannelPermissions: {
			user: {
				id: string;
				username: string;
				nickname: string;
			};
		}[];
	};

	let _channels: Channel[] = [];
	const channels = writable(_channels);

	const sortChannels = async (channels: Channel[]): Promise<Channel[]> => {
		const lastMessageTimes = new Map<string, number>();
		for (const channel of channels) {
			if (channel.lastMessageId) {
				const message = await libWhispr.getMessage(channel.id, channel.lastMessageId);
				lastMessageTimes.set(channel.id, new Date(message.createdAt).getTime());
			}
		}

		channels.sort((a: Channel, b: Channel) => {
			const aTime = lastMessageTimes.get(a.id);
			const bTime = lastMessageTimes.get(b.id);

			console.log(a.id, b.id, aTime, bTime);

			if (aTime && bTime) {
				return bTime - aTime;
			} else if (aTime) {
				return -1;
			} else if (bTime) {
				return 1;
			} else {
				return 0;
			}
		});

		return channels;
	};

	$: {
		_channels.length = 0;
		channels.set(_channels);
		libWhispr.getChannels().then(async (response: Channel[]) => {
			response = await sortChannels(response);

			for (const channel of response) {
				_channels.push(channel);
				channels.set(_channels);
			}
		});
	}

	// Messages
	type Author = {
		id: string;
		username: string;
		nickname: string;
		keyPair: {
			publicKey: string;
		};
	};

	type Message = {
		id: string;
		channelId?: string;
		createdAt: string;
		updatedAt: string;
		author: Author;
		content: string;
	};
	const _messages: Message[][] = [];

	const messages = writable(_messages);

	const stream = gateway.streamWritable;

	let userMessage = '';

	const sendMessage = async () => {
		if (!userMessage) return;
		if (userMessage.length > 2000) return;
		await libWhispr.sendMessage(id, userMessage);
		userMessage = '';
	};

	$: {
		_messages.length = 0;
		messages.set(_messages);

		if (mounted && id !== '@self') {
			libWhispr
				.fetchMessages(id)
				.then(async (response) => {
					for (const msg of response.reverse()) {
						const content = await libWhispr.decryptMessageContent(
							msg.content.cipherText,
							msg.author,
							msg.content.encryptedSymmetricKey
						);

						if (content) msg.content = content;

						const lastMessageCluster = _messages[0];

						if (
							lastMessageCluster &&
							lastMessageCluster[0].author.id === msg.author.id &&
							new Date(msg.createdAt).getTime() -
								new Date(lastMessageCluster[0].createdAt).getTime() <
								300000
						) {
							lastMessageCluster.unshift(msg);
						} else {
							_messages.unshift([msg]);
						}
					}
					messages.set(_messages);
				})
				.then(() => {
					chatElement?.scrollTo(0, chatElement.scrollHeight);
					console.log(chatElement?.scrollHeight, chatElement?.scrollTop);
				});
		}
	}

	stream.subscribe(async (msgs) => {
		if (!mounted) return;

		const message = msgs[0];

		const parsed = JSON.parse(message.data);

		if (parsed.op === OpCode.Notification) {
			switch (parsed.t) {
				case GatewayServerEvent.MessageCreate: {
					parsed.d.content = parsed.d.content.find(
						(content: {
							id: string;
							cipherText: string;
							targetUserId: string;
							messageId: string;
							encryptedSymmetricKey: string;
						}) => content.targetUserId === $authedUser?.userId
					);
					const content = await libWhispr.decryptMessageContent(
						parsed.d.content.cipherText,
						parsed.d.author,
						parsed.d.content.encryptedSymmetricKey
					);

					if (content) parsed.d.content = content;

					const message = parsed.d as Message;

					if (message.channelId === id) {
						const lastMessageCluster = _messages[0];

						if (
							lastMessageCluster &&
							lastMessageCluster[0].author.id === message.author.id &&
							new Date(message.createdAt).getTime() -
								new Date(lastMessageCluster[0].createdAt).getTime() <
								300000
						) {
							lastMessageCluster.unshift(message);
						} else {
							_messages.unshift([message]);
						}
						messages.set(_messages);
					}

					const channel = _channels.find((channel) => channel.id === message.channelId);
					if (channel) {
						channel.lastMessageId = message.id;
						_channels = await sortChannels(_channels);
						channels.set(_channels);
					}
					break;
				}
				case GatewayServerEvent.ChannelCreate: {
					const channel = parsed.d.channel as Channel;
					_channels.push(channel);
					channels.set(_channels);
					break;
				}
			}
		}
	});

	const signout = async () => {
		try {
			await libWhispr.signout();
			browser && goto('/');
			browser && window.location.reload();
		} catch (e) {}
	};

	const getTimeSince = (unix: number) => {
		// 1m, 1h, 1d, 1w, 1mo, 1y. if < 1m, show 1m
		const now = new Date().getTime();
		const diff = now - unix;

		if (diff < 60000) {
			return '1m';
		} else if (diff < 3600000) {
			return `${Math.floor(diff / 60000)}m`;
		} else if (diff < 86400000) {
			return `${Math.floor(diff / 3600000)}h`;
		} else if (diff < 604800000) {
			return `${Math.floor(diff / 86400000)}d`;
		} else if (diff < 2629800000) {
			return `${Math.floor(diff / 604800000)}w`;
		} else if (diff < 31557600000) {
			return `${Math.floor(diff / 2629800000)}mo`;
		} else {
			return `${Math.floor(diff / 31557600000)}y`;
		}
	};

	// Settings
	let settingsOpen = false;
</script>

<svelte:head>
	{#if id === '@self'}
		<title>Channels - Whispr</title>
	{:else}
		{#await libWhispr.getChannel(id)}
			<title>Channel - Whispr</title>
		{:then channel}
			<title>
				{channel.userChannelPermissions.length === 2
					? getUserFromUsers(channel.userChannelPermissions)?.nickname
					: channel.name}{' '}
				- Whispr
			</title>
		{:catch}
			<title>Channel - Whispr</title>
		{/await}
	{/if}
</svelte:head>

{#if createChannelModalOpen}
	<div class="add-channel">
		<h1>Start a new chat</h1>
		<form on:submit|preventDefault={createChannel} method="dialog">
			<!-- <input type="text" id="name" bind:value={username} /> -->
			<Input
				bind:value={createChannelUsername}
				placeholder="Username"
				highlightError={!!createChannelError}
				errorMessage={createChannelError}><i class="bi bi-type icon"></i></Input
			>
			<br />
			<button type="submit">Open</button>
		</form>
		<button
			on:click={() => {
				createChannelModalOpen = false;
				createChannelUsername = '';
				createChannelError = '';
			}}>Close</button
		>
	</div>
{/if}

{#if !mobile}
	<Settings open={settingsOpen} on:close={() => (settingsOpen = false)}></Settings>
	<div class="top">
		<div class="side-bar">
			<div class="options">
				<Profile nickname={$authedUser?.username} status={'online'}></Profile>
				<button on:click={() => (settingsOpen = true)} class="button-bg">
					<i class="bi bi-gear-wide-connected"></i>
					<!-- <i class="bi bi-box-arrow-right"></i> -->
				</button>
				<!-- <button>
				<i class="bi bi-gear"></i>
			</button> -->
			</div>
			<div class="chats-options">
				<Input bind:value={chatSearchString} placeholder="Search chats"
					><i class="bi bi-search"></i></Input
				>
				<button
					class="new-chat"
					on:click={() => {
						createChannelModalOpen = true;
					}}
				>
					<i class="bi bi-pencil"></i>
				</button>
			</div>
			<div class="chats">
				{#each $channels as channel}
					<a href="/channels/{channel.id}">
						{#if channel.userChannelPermissions.length === 2}
							<Profile
								nickname={getUserFromUsers(channel.userChannelPermissions)?.username}
								status={'online'}
							></Profile>
						{/if}
						<div class="chat-content">
							<div class="name-and-time">
								<h2 class="name">
									{channel.userChannelPermissions.length === 2
										? getUserFromUsers(channel.userChannelPermissions)?.nickname
										: channel.name}
								</h2>
								{#if channel.lastMessageId}
									<h2 class="time" id={`${channel.id}-time`}>
										{#await libWhispr.getMessage(channel.id, channel.lastMessageId)}
											<MockText style="height: 20px; width: 40px;" />
										{:then message}
											{getTimeSince(new Date(message.createdAt).getTime())}
										{/await}
									</h2>
								{/if}
							</div>
							{#if channel.lastMessageId}
								{#await getLastMessageContent(channel.id, channel.lastMessageId)}
									<p id={`${channel.id}-message`}>
										<MockText style="height: 20px; width: 100px;" />.
									</p>
								{:then message}
									<p id={`${channel.id}-message`}>
										{`${message.author.nickname}: ${message.content}`}
									</p>
								{/await}
							{/if}
						</div>
					</a>
					<br />
				{/each}
			</div>
			<div class="fade-out"></div>
		</div>
		<div class="main">
			<div class="top-bar">
				{#if id !== '@self'}
					{#await libWhispr.getChannel(id)}
						<h2><MockText style="height: 20px; width: 300px;" /></h2>
						<h3 class="handle"><MockText style="height: 20px; width: 200px;" /></h3>
					{:then channel}
						{#if channel.userChannelPermissions.length === 2}
							<Profile
								nickname={getUserFromUsers(channel.userChannelPermissions)?.username}
								status={'online'}
							></Profile>
						{/if}
						<h2>
							{channel.userChannelPermissions.length === 2
								? getUserFromUsers(channel.userChannelPermissions)?.nickname
								: channel.name}
						</h2>
						<h3 class="handle">
							{`${
								channel.userChannelPermissions.length === 2
									? getUserFromUsers(channel.userChannelPermissions)?.username
									: channel.name
							}@${(browser && window.location.hostname) || ''}`}
						</h3>
					{/await}
				{/if}
			</div>
			<div class="chat">
				{#each $messages as messageCluster}
					<!-- profileUrl={messageCluster[messageCluster.length - 1].author.avatar} -->
					<Message
						date={new Date(messageCluster[0].createdAt)}
						username={messageCluster[0].author.nickname}
						sentByMe={messageCluster[0].author.id === $authedUser?.userId}
						groupMessage={false}
					>
						{#each messageCluster as message}
							<p class="message-p" class:emoji-large={emojiRegex.test(message.content)}>
								{message.content}
							</p>
						{/each}
					</Message>
				{/each}
			</div>
			<div class="chat-bar">
				{#if id !== '@self'}
					{#await libWhispr.getChannel(id) then channel}
						<form on:submit|preventDefault={sendMessage}>
							<Input
								type="text"
								bind:value={userMessage}
								autocomplete="false"
								placeholder={`Message ${
									channel.userChannelPermissions.length === 2
										? getUserFromUsers(channel.userChannelPermissions)?.nickname
										: channel.name
								}`}
							>
								<!-- <i class="bi bi-paperclip icon"></i> -->
							</Input>
							<button>
								<i class="bi bi-send"></i>
							</button>
						</form>
					{/await}
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="mobile">
		{#if id === '@self'}
			<div class="top">
				<div class="chats-options">
					<button on:click={signout} class="profile">
						<i class="bi bi-box-arrow-right"></i>
					</button>
					<Input bind:value={chatSearchString} placeholder="Search chats"
						><i class="bi bi-search"></i></Input
					>
					<button
						class="new-chat"
						on:click={() => {
							createChannelModalOpen = true;
						}}
					>
						<i class="bi bi-pencil"></i>
					</button>
				</div>
			</div>
			<div class="chats">
				{#each $channels as channel}
					<a href="/channels/{channel.id}">
						<div>
							<div class="name-and-time">
								<h2 class="name">
									{channel.userChannelPermissions.length === 2
										? getUserFromUsers(channel.userChannelPermissions)?.nickname
										: channel.name}
								</h2>
								{#if channel.lastMessageId}
									<h2 class="time" id={`${channel.id}-time`}>
										{#await libWhispr.getMessage(channel.id, channel.lastMessageId)}
											<MockText style="height: 20px; width: 40px;" />
										{:then message}
											{getTimeSince(new Date(message.createdAt).getTime())}
										{/await}
									</h2>
								{/if}
							</div>
							{#if channel.lastMessageId}
								{#await getLastMessageContent(channel.id, channel.lastMessageId)}
									<p id={`${channel.id}-message`}>
										<MockText style="height: 20px; width: 100px;" />.
									</p>
								{:then message}
									<p id={`${channel.id}-message`}>
										{`${message.author.nickname}: ${message.content}`}
									</p>
								{/await}
							{/if}
						</div>
					</a>
					<br />
				{/each}
			</div>
		{:else}
			<div class="channel">
				<div class="top-bar">
					<a class="back" href="/channels/@self">
						<i class="bi bi-arrow-left"></i>
					</a>
					{#await libWhispr.getChannel(id)}
						<div class="user">
							<h2><MockText style="height: 20px; width: 300px;" /></h2>
							<h3 class="handle"><MockText style="height: 20px; width: 200px;" /></h3>
						</div>
					{:then channel}
						<div class="user">
							<h2>
								{channel.userChannelPermissions.length === 2
									? getUserFromUsers(channel.userChannelPermissions)?.nickname
									: channel.name}
							</h2>
							<h3 class="handle">
								{`${
									channel.userChannelPermissions.length === 2
										? getUserFromUsers(channel.userChannelPermissions)?.username
										: channel.name
								}@${(browser && window.location.hostname) || ''}`}
							</h3>
						</div>
					{/await}
				</div>
				<div bind:this={chatElement} class="chat">
					{#each $messages as messageCluster}
						<!-- profileUrl={messageCluster[messageCluster.length - 1].author.avatar} -->
						<Message
							date={new Date(messageCluster[0].createdAt)}
							username={messageCluster[0].author.nickname}
							sentByMe={messageCluster[0].author.id === $authedUser?.userId}
							groupMessage={false}
						>
							{#each messageCluster as message}
								<p class="message-p" class:emoji-large={emojiRegex.test(message.content)}>
									{message.content}
								</p>
							{/each}
						</Message>
					{/each}
				</div>
				<div class="chat-bar">
					{#if id !== '@self'}
						{#await libWhispr.getChannel(id) then channel}
							<form on:submit|preventDefault={sendMessage}>
								<Input
									type="text"
									bind:value={userMessage}
									autocomplete="false"
									placeholder={`Message ${
										channel.userChannelPermissions.length === 2
											? getUserFromUsers(channel.userChannelPermissions)?.nickname
											: channel.name
									}`}
								>
									<!-- <i class="bi bi-paperclip icon"></i> -->
								</Input>
								<button>
									<i class="bi bi-send"></i>
								</button>
							</form>
						{/await}
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;
	@use 'lib/styles/zIndexes.scss' as zIndexes;
	@use 'lib/styles/textSize.scss' as textSize;

	.mobile {
		.channel {
			width: 100%;
			height: 100%;
			z-index: 1000;
			background-color: colours.$background-100;
			position: absolute;
			top: 0;
			left: 0;

			display: flex;
			flex-direction: column;

			// overflow-y: scroll;

			.top-bar {
				width: calc(100% - 15px);
				height: 65px;
				background-color: colours.$background-secondary-100;
				border-bottom: 1px solid colours.$outline-100;

				padding-left: 15px;

				display: flex;
				justify-content: flex-start;
				align-items: center;

				gap: 10px;

				.handle {
					color: colours.$text-secondary-100;
				}

				.back {
					border-radius: 100px;
					padding: 10px;
					display: flex;
					justify-content: center;
					align-items: center;
					aspect-ratio: 1;
					height: 20px;
					width: 20px;

					i {
						color: colours.$text-100;
						scale: 1.5;
					}
				}

				.user {
					display: flex;
					flex-direction: column;

					h2,
					h3 {
						margin: 2px;
					}

					h2 {
						font-size: medium;
					}

					h3 {
						font-size: small;
					}
				}
			}

			.chat {
				flex-grow: 1;
				padding: 10px;
				width: calc(100% - 20px);

				display: flex;
				flex-direction: column-reverse;

				overflow-y: scroll;
			}

			.chat-bar {
				width: calc(100% - 20px);
				height: 40px;
				background: none;

				padding: 10px;
				padding-bottom: 30px;

				display: flex;
				justify-content: flex-start;
				align-items: center;

				form {
					width: 100%;

					text-align: center;

					display: flex;
					justify-content: center;
					align-items: center;
					gap: 10px;

					i {
						color: colours.$text-secondary-100;
					}
				}

				gap: 10px;
			}
		}

		.top {
			position: sticky;
			top: 0;
			padding: 10px;
			height: auto;
			background-color: colours.$background-secondary-50;

			backdrop-filter: blur(10px);
			position: sticky;

			.chats-options {
				padding: 10px;
				height: 22px;

				display: flex;
				justify-content: center;
				align-items: center;
				gap: 10px;

				.new-chat {
					height: calc(100% + 20px);
					aspect-ratio: 1;
				}

				i {
					color: colours.$text-secondary-100;
				}
			}
		}

		.chats {
			width: calc(100% - 20px);
			height: calc(100% - 20px);
			overflow-y: scroll;
			padding: 10px;

			a {
				text-decoration: none;
				color: colours.$text-100;

				border-radius: 8px;

				&:hover {
					background-color: colours.$background-tertiary-100;
				}

				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: flex-start;

				padding: 10px;

				div {
					width: 100%;
				}

				.chat-content {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: flex-start;

					p {
						margin: 0;
						margin-top: 3px;
						color: colours.$text-secondary-100;

						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
					}

					.name-and-time {
						display: flex;
						justify-content: space-between;
						align-items: center;
						width: 100%;

						h2 {
							margin: 0;
						}

						.name {
							max-width: 300px;
							overflow: hidden;
							text-overflow: ellipsis;
							font-size: textSize.$medium;
						}

						.time {
							color: colours.$text-secondary-100;
							width: 100px;
							right: 0;
							text-align: right;
							display: flex;
							justify-content: flex-end;
							font-size: textSize.$medium;
						}
					}
				}
			}
		}
	}

	.add-channel {
		width: 350px;

		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		border-radius: 25px;
		border: 1px solid colours.$outline-100;
		background-color: colours.$background-tertiary-100;
		color: colours.$text-100;

		z-index: zIndexes.$modal;

		box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.3);

		padding: 25px;

		&::backdrop {
			background-color: colours.$background-50;
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
		}

		form {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 1rem;
			* {
				text-align: center;
			}
			width: 100%;
			margin-bottom: 10px;
		}
		button {
			width: 100%;
		}
	}

	.top {
		display: flex;
		flex-direction: row;
		height: 100vh;
		justify-content: center;

		.side-bar {
			width: 300px;
			height: 100vh;
			background-color: colours.$background-secondary-100;
			border-right: 1px solid colours.$outline-100;

			display: flex;
			flex-direction: column;
			align-items: center;

			position: relative;

			.options {
				width: calc(100% - 30px);
				height: 40px;
				background: none;
				padding: 10px;
				padding-right: 0px;
				display: flex;
				justify-content: end;
				align-items: center;
				gap: 10px;

				.button-bg {
					border-radius: 50%;
					background-color: colours.$button-100;

					i {
						color: colours.$text-100;
					}

					&:hover {
						background-color: colours.$button-hover-100;
					}
				}

				button {
					aspect-ratio: 1;
					height: 100%;
					background: none;
					border: none;
					outline: none;
					cursor: pointer;
					display: flex;
					justify-content: center;
					align-items: center;

					i {
						scale: 1.5;
						color: colours.$text-secondary-100;
					}
				}
			}

			.chats-options {
				padding: 10px;
				height: 20px;

				margin-bottom: 10px;

				display: flex;
				justify-content: center;
				align-items: center;
				gap: 10px;

				.new-chat {
					height: calc(100% + 20px);
					aspect-ratio: 1;
				}

				i {
					color: colours.$text-secondary-100;
				}
			}

			.chats {
				flex-grow: 1;
				width: calc(100% - 20px);
				height: calc(100vh - 120px);
				overflow-y: scroll;
				padding: 10px;
				padding-bottom: 200px;

				a {
					text-decoration: none;
					color: colours.$text-100;

					border-radius: 8px;

					&:hover {
						background-color: colours.$background-tertiary-100;
					}

					display: flex;
					flex-direction: row;
					justify-content: flex-start;
					align-items: center;

					padding: 10px;
					gap: 10px;

					div {
						width: 100%;
					}

					.chat-content {
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: flex-start;

						p {
							margin: 0;
							margin-top: 3px;
							color: colours.$text-secondary-100;

							text-overflow: ellipsis;
							overflow: hidden;
							white-space: nowrap;
							max-width: 200px;
						}

						.name-and-time {
							display: flex;
							justify-content: space-between;
							align-items: center;
							width: 100%;

							h2 {
								margin: 0;
							}

							.name {
								max-width: 150px;
								overflow: hidden;
								text-overflow: ellipsis;
								font-size: textSize.$medium;
							}

							.time {
								color: colours.$text-secondary-100;
								right: 0;
								text-align: right;
								display: flex;
								justify-content: flex-end;
								font-size: textSize.$medium;
							}
						}
					}
				}
			}

			.fade-out {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				height: 200px;
				background: linear-gradient(
					0deg,
					colours.$background-secondary-100 25%,
					colours.$background-secondary-0 100%
				);
				pointer-events: none;
				z-index: 1;
			}
		}

		.main {
			flex-grow: 1;
			height: 100vh;

			display: flex;
			flex-direction: column;

			.top-bar {
				width: calc(100% - 15px);
				height: 65px;
				background-color: colours.$background-secondary-100;
				border-bottom: 1px solid colours.$outline-100;

				padding-left: 15px;

				display: flex;
				justify-content: flex-start;
				align-items: center;

				gap: 10px;

				.handle {
					color: colours.$text-secondary-100;
				}
			}

			.chat {
				flex-grow: 1;
				padding: 10px;
				width: calc(100% - 20px);

				display: flex;
				flex-direction: column-reverse;

				overflow-y: scroll;
			}

			.chat-bar {
				width: calc(100% - 20px);
				height: 40px;
				background: none;

				padding: 10px;

				display: flex;
				justify-content: flex-start;
				align-items: center;

				form {
					width: 100%;

					text-align: center;

					display: flex;
					justify-content: center;
					align-items: center;
					gap: 10px;

					i {
						color: colours.$text-secondary-100;
					}
				}

				gap: 10px;
			}
		}
	}

	.emoji-large {
		font-size: textSize.$largest;
	}

	.message-p {
		margin: 0;
		margin-bottom: 10px;
		max-width: 800px;
		word-break: break-word;
	}
</style>
