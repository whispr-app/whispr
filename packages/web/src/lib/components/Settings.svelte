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
	<div class="bg-background-950 flex flex-row h-dvh justify-center z-50">
		<button
			class="absolute top-4 right-4 rounded-full aspect-square bg-background-800 p-3 text-text-100 hover:bg-background-700 flex justify-center items-center"
			on:click={() => dispatch('close')}
			><i class="bi bi-x-lg w-fit h-4 flex justify-center items-center"></i></button
		>
		<div class="w-80 min-w-80 h-dvh bg-background-900 flex flex-col items-center relative px-4">
			<h2 class="text-xl font-medium m-0.5 mt-4 text-text-400 text-left w-full px-1.5">
				User Settings
			</h2>
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
				on:click={() => (settingPage = 'account')}>Account</button
			>
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
				on:click={() => (settingPage = 'privacy')}>Privacy</button
			>
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
				on:click={() => (settingPage = 'instance')}>Instance</button
			>
			<h2 class="text-xl font-medium m-0.5 mt-4 text-text-400 text-left w-full px-1.5">
				App Settings
			</h2>
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
				on:click={() => (settingPage = 'appearance')}>Appearance</button
			>
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
				on:click={() => (settingPage = 'accessibility')}>Accessibility</button
			>
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
				on:click={() => (settingPage = 'notifications')}>Notifications</button
			>
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
				on:click={() => (settingPage = 'keybinds')}>Keybinds</button
			>
			<h2 class="text-xl font-medium m-0.5 mt-4 text-text-400 text-left w-full px-1.5">Extra</h2>
			{#await libWhispr.isAuthorised() then isAuthorised}
				{#if isAuthorised}
					<button
						class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
						on:click={() => goto('/admin')}>Admin</button
					>
				{/if}
			{/await}
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors"
				on:click={() => (settingPage = 'change_log')}>Change Log</button
			>
			<button
				class="text-text-100 bg-transparent w-full rounded-lg hover:bg-background-800 flex flex-row justify-start items-center p-1.5 pl-2 gap-4 font-medium transition-colors hover:text-red-500"
				on:click={signout}
				>Log Out <span class="ml-auto"><i class="bi bi-box-arrow-right text-text-400"></i></span
				></button
			>
			<hr class="border-t border-background-500 w-[calc(100%_-_16px)] m-2" />
			<a
				class="text-text-400 w-full text-left px-1.5 m-0.5"
				target="_blank"
				href="https://github.com/whispr-app/whispr/commit/{gitHash.full}"
				>v{version} ({gitHash.short})</a
			>
			<p class="text-text-400 w-full text-left px-1.5 m-0.5">
				{libWhispr.fetchBrowserVersion()}
			</p>
		</div>
		<main class="flex-grow h-dvh flex flex-col w-full">
			<svelte:component this={settingPages[settingPage]} />
		</main>
	</div>
{/if}
