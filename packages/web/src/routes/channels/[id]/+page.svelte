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
	import MessageOld from '$lib/components/MessageOld.svelte';
	import MockText from '$lib/components/MockText.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import WhisprLogoWhite from '$lib/components/whispr-logo-white.svelte';
	import FormattedMessageContent from '$lib/components/FormattedMessageContent.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import Message from '$lib/components/Message.svelte';
	import TooltipContainer from '$lib/components/TooltipContainer.svelte';
	import Button from '$lib/components/Button.svelte';

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

	let message = '';

	const sendMessage = async () => {
		if (!message) return;
		if (message.length > 2000) return;
		await libWhispr.sendMessage(id, message);
		message = '';
	};

	$: {
		_messages.length = 0;
		messages.set(_messages);

		if (mounted && id !== '@self') {
			libWhispr.fetchMessages(id).then(async (response) => {
				for (const msg of response.reverse()) {
					const content = await libWhispr.decryptMessageContent(
						msg.content.cipherText,
						msg.author,
						msg.content.encryptedSymmetricKey
					);

					msg.content = content;

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
				requestAnimationFrame(() => {
					chatElement?.scrollTo(0, chatElement.scrollHeight);
				});
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
					parsed.d.content = await libWhispr.decryptMessageContent(
						parsed.d.content.cipherText,
						parsed.d.author,
						parsed.d.content.encryptedSymmetricKey
					);

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
						requestAnimationFrame(() => {
							chatElement?.scrollTo(0, chatElement.scrollHeight);
						});
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
	<div
		class="fixed left-0 top-0 right-0 bottom-0 z-50 backdrop-blur-md bg-background-950 bg-opacity-30"
	>
		<div
			class="w-96 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center justify-center rounded-3xl bg-background-900 p-6 px-10 shadow-md shadow-background-950 z-50 text-text-100 gap-2"
		>
			<h1 class="text-2xl">Start a new chat</h1>

			<Input
				bind:value={createChannelUsername}
				placeholder="Username"
				highlightError={!!createChannelError}
				errorMessage={createChannelError}><i class="bi bi-type icon"></i></Input
			>
			<div class="flex flex-row gap-2">
				<Button
					variant="secondary"
					on:click={() => {
						createChannelModalOpen = false;
						createChannelUsername = '';
						createChannelError = '';
					}}>Close</Button
				>
				<Button on:click={createChannel}>Open</Button>
			</div>
		</div>
	</div>
{/if}

{#if !mobile}
	<TooltipContainer></TooltipContainer>
	<Settings open={settingsOpen} on:close={() => (settingsOpen = false)}></Settings>
	<div class="flex flex-row h-dvh justify-center">
		<div class="w-80 min-w-80 h-dvh bg-background-900 flex flex-col items-center relative">
			<div class="h-10 my-2.5 px-2.5 w-full flex justify-end items-center gap-2.5">
				<div class="flex flex-1 justify-start">
					<WhisprLogoWhite></WhisprLogoWhite>
				</div>
				<Profile nickname={$authedUser?.username} status={'online'}></Profile>
				<button
					on:click={() => (settingsOpen = true)}
					class="rounded-full bg-background-800 text-text-100 hover:bg-background-700 aspect-square h-full flex justify-center items-center"
				>
					<i class="bi bi-gear-wide-connected mt-[2px] scale-[1.75]"></i>
					<!-- <i class="bi bi-box-arrow-right"></i> -->
				</button>
				<!-- <button>
				<i class="bi bi-gear"></i>
			</button> -->
			</div>
			<div class="px-2.5 h-10 mb-2.5 pt-0 flex justify-center items-center gap-2.5 w-full">
				<Input bind:value={chatSearchString} placeholder="Search chats"
					><i class="bi bi-search text-text-400"></i></Input
				>
				<button
					class="h-full aspect-square rounded-full flex justify-center items-center bg-background-800 hover:bg-background-700"
					on:click={() => {
						createChannelModalOpen = true;
					}}
				>
					<i class="bi bi-pencil text-text-400"></i>
				</button>
			</div>
			<div class="flex-grow w-full h-full overflow-y-scroll p-2.5 pb-52 pr-4 channelsScrollbar">
				{#each $channels as channel}
					{#if chatSearchString.length === 0 || (channel.userChannelPermissions.length === 2 && getUserFromUsers(channel.userChannelPermissions)
								?.nickname.toLowerCase()
								.includes(chatSearchString.toLowerCase())) || channel.name
							?.toLowerCase()
							.includes(chatSearchString.toLowerCase())}
						<a
							style="text-decoration: none;"
							class="no-underline w-full text-text-100 rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-2.5 gap-2.5"
							href="/channels/{channel.id}"
						>
							{#if channel.userChannelPermissions.length === 2}
								<div class="aspect-square">
									<Profile
										nickname={getUserFromUsers(channel.userChannelPermissions)?.username}
										status={'online'}
									></Profile>
								</div>
							{/if}
							<div class="w-full flex flex-col justify-center items-start">
								<div class="flex justify-between items-center w-full">
									<h2 class="max-w-44 overflow-hidden text-ellipsis text-lg">
										{channel.userChannelPermissions.length === 2
											? getUserFromUsers(channel.userChannelPermissions)?.nickname
											: channel.name}
									</h2>
									{#if channel.lastMessageId}
										<h2
											class="text-text-400 right-0 text-right flex justify-end text-lg"
											id={`${channel.id}-time`}
										>
											{#await libWhispr.getMessage(channel.id, channel.lastMessageId)}
												<Placeholder maxWidth={40}></Placeholder>
											{:then message}
												{getTimeSince(new Date(message.createdAt).getTime())}
											{/await}
										</h2>
									{/if}
								</div>
								{#if channel.lastMessageId}
									{#await libWhispr.getMessage(channel.id, channel.lastMessageId) then message}
										{#await libWhispr.decryptMessageContent(message.content.cipherText, message.author, message.content.encryptedSymmetricKey)}
											<p
												class="m-0 mt-1 text-text-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-52"
												id={`${channel.id}-message`}
											>
												<Placeholder maxWidth={200}></Placeholder>
											</p>
										{:then decryptedMessage}
											<p
												class="m-0 mt-1 text-text-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-52"
												id={`${channel.id}-message`}
											>
												{`${message.author.nickname}: ${decryptedMessage}`}
											</p>
										{/await}
									{/await}
								{/if}
							</div>
						</a>
						<br />{/if}
				{/each}
			</div>
			<div
				class="absolute bottom-0 left-0 right-0 h-52 backdrop-blur-lg blur-mask pointer-events-none z-1 bg-background-900 bg-opacity-50"
			></div>
			<div
				class="absolute bottom-0 left-0 right-0 h-52 pointer-events-none z-2 bg-gradient-to-t from-background-900 bg-opacity-50"
			></div>
		</div>
		<div class="flex-grow h-dvh flex flex-col w-full">
			<div
				class="w-full h-16 min-h-16 bg-background-925 pl-4 flex justify-start items-center gap-2"
			>
				{#if id !== '@self'}
					{#await libWhispr.getChannel(id)}
						<h2><Placeholder maxWidth={300}></Placeholder></h2>
						<h3 class="text-text-400"><Placeholder maxWidth={200}></Placeholder></h3>
					{:then channel}
						{#if channel.userChannelPermissions.length === 2}
							<Profile
								nickname={getUserFromUsers(channel.userChannelPermissions)?.username}
								status={'online'}
							></Profile>
						{/if}
						<h2 class="text-text-100 font-normal">
							{channel.userChannelPermissions.length === 2
								? getUserFromUsers(channel.userChannelPermissions)?.nickname
								: channel.name}
						</h2>
						<h3 class="text-text-400">
							{`${
								channel.userChannelPermissions.length === 2
									? getUserFromUsers(channel.userChannelPermissions)?.username
									: channel.name
							}@${(browser && window.location.hostname) || ''}`}
						</h3>
					{/await}
				{/if}
			</div>
			<div
				bind:this={chatElement}
				class="flex-grow p-2.5 w-full flex flex-col overflow-y-scroll overflow-x-hidden"
			>
				{#each $messages.slice().reverse() as messageCluster}
					<Message
						side={messageCluster[0].author.id === $authedUser?.userId ? 'right' : 'left'}
						messages={messageCluster.slice().reverse()}
					></Message>
				{/each}
			</div>
			<div class="w-full h-fit p-2.5 flex justify-center items-center gap-2.5">
				{#if id !== '@self'}
					{#await libWhispr.getChannel(id) then channel}
						<TextArea bind:value={message} on:submit={sendMessage}></TextArea>
					{/await}
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div
		class="fixed top-0 bottom-0 left-0 right-0 bg-background-925 flex justify-center items-center flex-col p-4"
	>
		<WhisprLogoWhite></WhisprLogoWhite>
		<h1 class="text-text-100 text-2xl text-center">
			<FormattedMessageContent content="Mobile is currently under renovation. :construction:"
			></FormattedMessageContent>
		</h1>
		<h2 class="text-text-400 text-xl text-center">Check back later or view on desktop :)</h2>
	</div>
	<!-- <div class="mobile">
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
								{#await libWhispr.getMessage(channel.id, channel.lastMessageId) then message}
									{#await libWhispr.decryptMessageContent(message.content.cipherText, message.author, message.content.encryptedSymmetricKey)}
										<p id={`${channel.id}-message`}>
											<MockText style="height: 20px; width: 100px;" />.
										</p>
									{:then decryptedMessage}
										<p id={`${channel.id}-message`}>
											{`${message.author.nickname}: ${decryptedMessage}`}
										</p>
									{/await}
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
						profileUrl={messageCluster[messageCluster.length - 1].author.avatar}
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
									bind:value={message}
									autocomplete="false"
									placeholder={`Message ${
										channel.userChannelPermissions.length === 2
											? getUserFromUsers(channel.userChannelPermissions)?.nickname
											: channel.name
									}`}
								>
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
	</div> -->
{/if}

<style lang="postcss">
	.blur-mask {
		mask-image: linear-gradient(0deg, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 100%);

		-webkit-mask-image: linear-gradient(0deg, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 100%);
	}

	:global(html) {
		overflow-x: hidden;
	}

	.channelsScrollbar::-webkit-scrollbar-thumb {
		background-color: theme('colors.background.700');
	}

	.channelsScrollbar {
		scrollbar-color: theme('colors.background.700') rgba(0, 0, 0, 0);
	}
</style>
