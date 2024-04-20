<script lang="ts">
	import { authedUser, libWhispr } from '$lib/libWhispr';
	import { browser } from '$app/environment';
	import Profile from '../Profile.svelte';

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

<h1>Account</h1>
<div class="profile">
	<Profile nickname={$authedUser?.username} status={'online'}></Profile>
</div>
{#await getUser() then user}
	<h2 class="no-margin">
		{user.nickname}<span
			><button disabled on:click={() => alert('This cannot be done yet.')} class="edit"
				><i class="bi bi-pencil"></i></button
			></span
		>
	</h2>
{/await}
<h3 class="text-secondary no-margin">
	{$authedUser?.username}@{`${(browser && window.location.hostname) || ''}`}
</h3>

<h2>Account removal</h2>
<button disabled on:click={() => alert('This cannot be done yet.')} class="button-danger"
	>Delete account</button
>
<p class="text-secondary">
	This action is instant and irreversible. After deleting your account, any associated data with
	your account will be removed as soon as possible.
</p>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;

	.profile {
		scale: 1.5;
		padding-left: 0.5rem;
		width: fit-content;

		margin-bottom: 1.5rem;
	}

	.no-margin {
		margin: 0px;
	}

	.edit {
		display: inline-block;
		background: none;
		border: none;
		color: colours.$text-secondary-100;
		scale: 1.1;
	}
</style>
