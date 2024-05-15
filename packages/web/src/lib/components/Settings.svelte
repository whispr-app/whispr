<script lang="ts">
	import { libWhispr } from '$lib/libWhispr';
	import { SvelteComponent, createEventDispatcher, type ComponentType } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	import Account from './settings/Account.svelte';
	import Privacy from './settings/Privacy.svelte';
	import Instance from './settings/Instance.svelte';
	import Appearance from './settings/Appearance.svelte';
	import Accessibility from './settings/Accessibility.svelte';
	import Notifications from './settings/Notifications.svelte';
	import Keybinds from './settings/Keybinds.svelte';
	import ChangeLog from './settings/ChangeLog.svelte';

	export let open = false;

	const dispatch = createEventDispatcher();

	const version = PKG.version;
	const gitHash = GIT_HASH;

	console.log(version, gitHash);

	const signout = async () => {
		try {
			await libWhispr.signout();
			browser && goto('/');
			browser && window.location.reload();
		} catch (e) {}
	};

	const settingPages: { [page: string]: ComponentType } = {
		account: Account,
		privacy: Privacy,
		instance: Instance,
		appearance: Appearance,
		accessibility: Accessibility,
		notifications: Notifications,
		keybinds: Keybinds,
		change_log: ChangeLog
	};
	let settingPage = 'account';
</script>

{#if open}
	<div class="main-container">
		<button class="button-bg close" on:click={() => dispatch('close')}
			><i class="bi bi-x-lg"></i></button
		>
		<div class="side-bar">
			<h2>User Settings</h2>
			<button on:click={() => (settingPage = 'account')}>Account</button>
			<button on:click={() => (settingPage = 'privacy')}>Privacy</button>
			<button on:click={() => (settingPage = 'instance')}>Instance</button>
			<h2>App Settings</h2>
			<button on:click={() => (settingPage = 'appearance')}>Appearance</button>
			<button on:click={() => (settingPage = 'accessibility')}>Accessibility</button>
			<button on:click={() => (settingPage = 'notifications')}>Notifications</button>
			<button on:click={() => (settingPage = 'keybinds')}>Keybinds</button>
			<h2>Extra</h2>
			{#await libWhispr.isAuthorised() then isAuthorised}
				{#if isAuthorised}
					<button on:click={() => goto('/admin')}>Admin</button>
				{/if}
			{/await}
			<button on:click={() => (settingPage = 'change_log')}>Change Log</button>
			<button class="danger" on:click={signout}
				>Log Out <span><i class="bi bi-box-arrow-right"></i></span></button
			>
			<hr />
			<a target="_blank" href="https://github.com/whispr-app/whispr/commit/{gitHash.full}"
				>v{version} ({gitHash.short})</a
			>
			<p>{libWhispr.fetchBrowserVersion()}</p>
		</div>
		<main>
			<svelte:component this={settingPages[settingPage]} />
		</main>
	</div>
{/if}
