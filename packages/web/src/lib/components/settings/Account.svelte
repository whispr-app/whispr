<script lang="ts">
	import { authedUser, libWhispr } from '$lib/libWhispr';
	import { browser } from '$app/environment';
	import Profile from '../Profile.svelte';
	import Button from '../Button.svelte';

	const getUser = async () => {
		if (!$authedUser) return;
		try {
			const user = await libWhispr.getUser($authedUser.username);
			return user;
		} catch (e) {
			console.error(e);
		}
	};
</script>

<div class="p-4">
	<h1 class="text-text-100 font-medium text-3xl">Account</h1>
	<div class="scale-150 pl-2 w-fit my-6">
		<Profile nickname={$authedUser?.username} status={'online'}></Profile>
	</div>
	{#await getUser() then user}
		<h2 class="text-text-100 text-2xl">
			{user.nickname}<span
				><button
					disabled
					on:click={() => alert('This cannot be done yet.')}
					class="inline-block text-text-400 opacity-50 cursor-not-allowed p-2"
					><i class="bi bi-pencil"></i></button
				></span
			>
		</h2>
	{/await}
	<h3 class="text-text-400 text-xl">
		{$authedUser?.username}@{`${(browser && window.location.hostname) || ''}`}
	</h3>

	<h2 class="text-text-100 text-2xl mt-4 font-medium">Account removal</h2>
	<div class="my-2">
		<Button disabled on:click={() => alert('This cannot be done yet.')} variant="danger"
			>Delete account</Button
		>
	</div>
	<p class="text-text-400">
		This action is instant and irreversible. After deleting your account, any associated data with
		your account will be removed as soon as possible.
	</p>
</div>
