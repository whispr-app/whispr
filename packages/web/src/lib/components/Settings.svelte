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

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;
	@use 'lib/styles/zIndexes.scss' as zIndexes;
	@use 'lib/styles/textSize.scss' as textSize;

	.danger {
		transition: color 0.2s;
		&:hover {
			color: colours.$error-100;
		}
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
	}

	.main-container {
		background-color: colours.$background-100;
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 100%;

		display: flex;
		flex-direction: row;
		justify-content: center;

		z-index: zIndexes.$settings;

		.side-bar {
			width: 300px;
			height: 100vh;
			background-color: colours.$background-secondary-100;
			border-right: 1px solid colours.$outline-100;

			display: flex;
			flex-direction: column;
			align-items: center;

			position: relative;

			// padding-top: 2rem; // For when this is integrated into macos

			h2 {
				font-size: textSize.$medium;
				margin: 2px;
				margin-top: 1rem;
				color: colours.$text-secondary-100;
				text-align: left;
				width: calc(100% - 2rem);
				padding: 0 1rem;
			}

			p,
			a {
				font-size: textSize.$regular;
				color: colours.$text-secondary-100;
				text-align: left;
				width: calc(100% - 2rem);
				padding: 0 1rem;
				margin: 2px;
			}
		}

		hr {
			width: 100%;
			border: 0;
			border-top: 1px solid colours.$outline-100;
		}

		main {
			flex-grow: 1;
			height: 100%;
			padding-left: 20px;
			padding-right: calc(3rem + 30px);

			display: flex;
			flex-direction: column;
		}
	}

	button {
		text-decoration: none;
		color: colours.$text-100;

		outline: none;
		border: none;
		background-color: transparent;
		width: calc(100% - 20px);

		border-radius: 8px;

		&:hover {
			background-color: colours.$background-tertiary-100;
		}

		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;

		padding: 5px;
		padding-left: 7.5px;
		gap: 10px;

		span {
			margin-left: auto;
			color: colours.$text-secondary-100;
		}
	}

	.button-bg {
		border-radius: 50%;
		background-color: colours.$button-100;

		aspect-ratio: 1;
		width: auto;
		outline: none;
		border: none;
		padding: calc(0.5rem + 3px);

		i {
			color: colours.$text-100;
		}

		&:hover {
			background-color: colours.$button-hover-100;
		}
	}
</style>
