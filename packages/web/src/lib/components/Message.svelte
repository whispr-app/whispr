<script lang="ts">
	export let sentByMe: boolean;
	export let groupMessage: boolean;
	export let date: Date = new Date();
	export let profileUrl: string = '';
	export let username: string = '';

	import formatDate from '$lib/formatDate';

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
			{formatDate(date)}
		</p>
	</div>
</div>
