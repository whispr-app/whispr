<script lang="ts">
	import { emojiMatch } from '$lib/messageContentLexer';
	import FormattedMessageContent from './FormattedMessageContent.svelte';

	type Reaction = {
		emoji: string;
		users: Author[];
		reacted: boolean;
	};

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
		quote?: Message;
		edited?: string;
		reactions?: Reaction[];
	};

	export let messages: Message[] = [];
	export let side: 'left' | 'right' = 'right';

	const calculateContextMenuPosition = (event: any, side: 'left' | 'right') => {
		const target: HTMLElement = event.target;

		const container = target.closest('#container') as HTMLElement;

		if (!container) return;
		const message = container.getElementsByTagName('div')[0];
		if (!message) return;
		const contextMenu = message.querySelector('#context-menu') as HTMLElement;
		if (!contextMenu) return;

		const contextMenuWidth = contextMenu.getBoundingClientRect().width;
		const messageWidth = message.offsetWidth;
		const containerWidth = container.offsetWidth;

		const contextMenuCellWidth = contextMenuWidth / contextMenu.children.length;

		contextMenu.style.visibility = 'visible';
		contextMenu.style.top = `-16px`;

		if (target.tagName === 'P') {
			contextMenu.style.top = `${target.offsetTop - 8 - 16}px`;
		} else {
			const content = target.closest('p');
			if (!content) return;
			contextMenu.style.top = `${content.offsetTop - 8 - 16}px`;
		}

		if (side === 'left') {
			let positionRight = contextMenuWidth - contextMenuCellWidth;

			if (messageWidth + positionRight + contextMenuCellWidth > containerWidth) {
				const messageMarginRight = parseFloat(getComputedStyle(message).marginRight);

				positionRight = containerWidth - (messageWidth + messageMarginRight * 2) + 8;
			}

			contextMenu.style.right = `-${positionRight}px`;
		} else if (side === 'right') {
			let positionLeft = contextMenuWidth - contextMenuCellWidth;

			if (messageWidth + positionLeft + contextMenuCellWidth > containerWidth) {
				const messageMarginLeft = parseFloat(getComputedStyle(message).marginLeft);

				positionLeft = containerWidth - (messageWidth + messageMarginLeft * 2) + 8;
			}

			contextMenu.style.left = `-${positionLeft}px`;
		}
	};

	const hideContextMenu = (event: any) => {
		const target: HTMLElement = event.target;
		const container = target.closest('#container') as HTMLElement;

		if (!container) return;
		const message = container.getElementsByTagName('div')[0];
		if (!message) return;
		const contextMenu = message.querySelector('#context-menu') as HTMLElement;
		if (!contextMenu) return;

		if (contextMenu.matches(':hover')) return;

		contextMenu.style.visibility = 'hidden';
	};

	const fetchEmoji = (emoji: string): string => {
		const e = emoji.match(emojiMatch)?.[0];

		if (!e) return '';
		return e.slice(1, e.length - 1);
	};
</script>

<div class="w-full flex flex-col" id="container">
	<div
		class="pt-2 pb-2 w-fit rounded-xl m-2 relative max-w-[800px] flex flex-col-reverse gap-1"
		class:bg-background-700={side === 'left'}
		class:rounded-es-none={side === 'left'}
		class:bg-primary-600={side === 'right'}
		class:rounded-ee-none={side === 'right'}
		class:place-self-end={side === 'right'}
	>
		{#each messages as message}
			<p
				on:mouseover={(e) => calculateContextMenuPosition(e, side)}
				on:mouseleave={hideContextMenu}
				on:focus={(e) => calculateContextMenuPosition(e, side)}
				on:focusout={hideContextMenu}
				role="listitem"
				class="text-text-100 pl-2 pr-2 break-all"
				class:text-left={side === 'left'}
				class:text-right={side === 'right'}
			>
				{#if message.quote}
					<div>
						<span class="inline-flex"><i class="bi bi-quote scale-125 opacity-60"></i></span>
						<span class="inline-flex flex-row justify-center items-center"
							><img
								src="https://ui-avatars.com/api/?name={message.quote.author
									.username}&background=ffffff&color=7d8590&length=1&size=256&bold=true"
								alt="profile"
								class="aspect-square h-4 opacity-60 scale-100 rounded-full inline-block mr-1.5 translate-y-[2px]"
							/><button
								class="text-text-100 opacity-60 font-semibold hover:underline scale-100 translate-y-[2px]"
								>{message.quote.author.username}:</button
							></span
						>
						<span
							><button class="text-text-100 opacity-60 hover:opacity-90 max-w-52 truncate"
								><FormattedMessageContent content={message.quote.content}
								></FormattedMessageContent></button
							></span
						>
					</div>
				{/if}
				<FormattedMessageContent content={message.content}></FormattedMessageContent>
				{#if message.edited}
					<span
						class="inline-flex flex-row justify-center items-center translate-y-0.5"
						data-tooltip={`Edited ${new Date(message.edited)?.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`}
						><i class="bi bi-pencil-fill opacity-60 scale-90 inline-flex"></i></span
					>
				{/if}
				{#if message.reactions}
					<div
						class:justify-end={side === 'right'}
						class:flex-row-reverse={side === 'right'}
						class="flex flex-row gap-1 items-center flex-wrap group"
					>
						{#each message.reactions as reaction}
							<button
								data-tooltip={`${reaction.users
									.map((u) => u.username)
									.join(', ')
									.replace(/\,(?=[^,]*$)/, ' &')} reacted with ${reaction.emoji}`}
								class={`${reaction.reacted ? 'border-background-100 bg-background-100' : 'border-background-300 bg-background-300 hover:border-background-100 hover:border-opacity-40'} transition-colors flex p-0.5 flex-row items-center gap-1 rounded-full border-2 border-opacity-40 bg-opacity-30 pl-1.5 pr-1.5 w-fit h-fit`}
							>
								{#each reaction.users as user}
									<img
										src="https://ui-avatars.com/api/?name={user.username}&background=ffffff&color=7d8590&length=1&size=256&bold=true"
										alt="profile"
										class="aspect-square h-3.5 rounded-full inline-block"
									/>
								{/each}
								<span class="text-text-100 text-[0.85rem] h-full">
									<i class="twa twa-{fetchEmoji(reaction.emoji)}"></i>
								</span>
							</button>
						{/each}
						<button
							data-tooltip="Add Reaction"
							class="transition-opacity scale-110 hidden group-hover:inline-block material-symbols-outlined opacity-80 hover:opacity-100"
							>add_reaction</button
						>
					</div>
				{/if}
			</p>
		{/each}
		<div
			on:mouseleave={hideContextMenu}
			on:focusout={hideContextMenu}
			role="listitem"
			id="context-menu"
			class="flex invisible flex-row absolute bg-background-900 rounded-full shadow-background-950 shadow-md text-text-100 overflow-hidden"
		>
			<button
				data-tooltip="Add Reaction"
				class="transition-colors aspect-square h-[32px] p-2 bg-transparent hover:bg-background-800 flex justify-center items-center"
				><i class="material-symbols-outlined scale-100 flex justify-center items-center"
					>add_reaction</i
				></button
			>
			<button
				data-tooltip="Quote"
				class="transition-colors h-full aspect-square p-2 bg-transparent hover:bg-background-800 flex justify-center items-center"
				><i class="bi bi-quote scale-125 flex justify-center items-center translate-y-[1px]"
				></i></button
			>
			{#if side === 'right'}
				<button
					data-tooltip="Edit"
					class="transition-colors h-full aspect-square p-2 bg-transparent hover:bg-background-800 flex justify-center items-center"
					><i class="bi bi-pencil-fill flex justify-center items-center"></i></button
				>
				<button
					data-tooltip="Delete"
					class="transition-colors h-full aspect-square p-2 bg-transparent hover:bg-background-800 flex justify-center items-center group"
					><i
						class="bi bi-trash-fill flex justify-center items-center group-hover:text-red-500 transition-colors"
					></i></button
				>
			{/if}
			<button
				data-tooltip="More Options"
				class="transition-colors h-full aspect-square p-2 bg-transparent hover:bg-background-800 flex justify-center items-center"
				><i class="bi bi-three-dots-vertical flex justify-center items-center"></i></button
			>
		</div>
	</div>
</div>
