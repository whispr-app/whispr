<script lang="ts">
	export let sentByMe: boolean;
	export let groupMessage: boolean;
	export let date: Date = new Date();
	export let profileUrl: string = '';
	export let username: string = '';

	import formateDate from '$lib/formateDate';

	const resolveProfile = async (url: string): Promise<string> => {
		if (url) {
			try {
				const response = await fetch(url);
				if (response.ok) return url;
			} catch {}
		}

		return '/profile.svg';
	};

	let profile = resolveProfile(profileUrl);
</script>

<div class="message">
	<div
		class="message-container"
		class:groupMessage={groupMessage === true && sentByMe === false}
		class:left={sentByMe === false}
		class:right={sentByMe === true}
	>
		{#if groupMessage === true && sentByMe === false}
			{#await profile}
				<img class="profile" src={'/profile.svg'} alt="Profile" />
			{:then url}
				<img class="profile" src={url} alt="Profile" />
			{/await}
		{/if}
		<div class="messages">
			<slot />
		</div>
		{#if groupMessage === true && sentByMe === false}
			<p class="username">{username || 'Username'}</p>
			<p class="separator">•</p>
		{/if}
		<p class="date" class:no-left-margin={groupMessage === true && sentByMe === false}>
			{formateDate(date)}
		</p>
	</div>
</div>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;
	@use 'lib/styles/textSize.scss' as textSize;

	.profile {
		width: 40px;
		aspect-ratio: 1;
		position: absolute;
		left: -50px;
		bottom: 0;
		border-radius: 50%;
	}

	.groupMessage {
		position: relative;
		left: 55px;
	}

	.date {
		color: colours.$text-secondary-100;
		margin: 10px;
		margin-top: 0;
		font-size: textSize.$small;
		display: inline-block;
	}

	.no-left-margin {
		margin-left: 0;
	}

	.separator {
		display: inline-block;
		color: colours.$text-secondary-100;
		font-size: textSize.$small;
		margin-top: 0;
	}

	.username {
		color: colours.$text-secondary-100;
		margin: 10px;
		margin-top: 0;

		margin-right: 0;
		font-size: textSize.$small;
		display: inline-block;
	}

	.left {
		:global(*) {
			text-align: left;
		}
		border-bottom-left-radius: 0 !important;
		float: left;
	}

	.right {
		:global(*) {
			text-align: right;
		}
		:global(.date) {
			float: right;
		}
		border-bottom-right-radius: 0 !important;
		float: right;
	}

	.message-container {
		padding: 2px;
		width: fit-content;
		background-color: colours.$background-tertiary-100;
		border: 1px solid colours.$outline-100;
		border-radius: 15px;
	}

	.messages {
		display: flex;
		flex-direction: column-reverse;
		margin: 10px;
	}

	.message {
		margin: 5px;
		width: auto;
	}
</style>
