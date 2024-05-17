<script lang="ts">
	import { libWhispr, authedUser } from '$lib/libWhispr';
	import { AxiosError } from 'axios';
	import { goto } from '$app/navigation';
	import WhisprLogoWhite from '$lib/components/whispr-logo-white.svelte';
	import Modal from '$lib/components/structure/Modal.svelte';
	import Input from '$lib/components/Input.svelte';
	import LoadingDots from '$lib/components/LoadingDots.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Button from '$lib/components/Button.svelte';

	const returnTo = (browser && $page.url.searchParams.get('returnTo')) || '/channels/@self';

	if ($authedUser) {
		browser && goto(returnTo);
	}

	let username = '';
	let password = '';

	let debounce = false;
	let errorMessage = '';

	let usernameError = '';
	let passwordError = '';

	const signin = async (e: Event) => {
		debounce = true;
		usernameError = '';
		passwordError = '';

		let canSubmit = true;
		if (!username) {
			usernameError = 'Username is required';
			e.preventDefault();
			canSubmit = false;
		}
		if (!password) {
			passwordError = 'Password is required';
			e.preventDefault();
			canSubmit = false;
		}
		if (!canSubmit) {
			debounce = false;
			return;
		}
		try {
			const response = await libWhispr.signin(username, password);

			if (response.status !== 200) {
				if (response.data.message) {
					usernameError = response.data.message;
				}
				debounce = false;
				return;
			}

			debounce = false;

			goto(returnTo);
			(e.target as HTMLFormElement).reset();
		} catch (e) {
			if (e instanceof AxiosError) {
				if (e.code === 'ECONNABORTED') {
					errorMessage = 'Request timed out';
				} else if (e.code === 'ERR_NETWORK') {
					errorMessage = 'Network error. Try again later';
				}
				if (e.response?.data?.message) {
					switch (e.response.data.message) {
						case 'Specified user was not found.':
						case 'User not found': {
							usernameError = e.response.data.message;
							break;
						}
						case 'Incorrect password': {
							passwordError = e.response.data.message;
							break;
						}
						default: {
							errorMessage = e.response.data.message;
							break;
						}
					}
				}
			}
			debounce = false;
			return;
		}
	};
</script>

<svelte:head>
	<title>Login - Whispr</title>
</svelte:head>

<main class="w-vw h-dvh overflow-hidden flex justify-center items-center">
	<div class="w-40 flex justify-center items-center absolute bottom-0 left-2.5">
		<WhisprLogoWhite />
	</div>
	<Modal>
		<form class="flex flex-col justify-center items-center text-center" on:submit|preventDefault>
			<h1 class="text-3xl">Log in</h1>
			{#if errorMessage}
				<p class="text-red-500 m-0 mb-2 relative top-0 w-full max-w-[418px]">{errorMessage}</p>
			{/if}
			<div class="mt-4">
				<Input
					type="username"
					placeholder="Username"
					bind:value={username}
					highlightError={!!usernameError}
					errorMessage={usernameError}
					change={() => {
						usernameError = '';
						if (username === '') {
							usernameError = 'Username must not be empty';
						}
					}}><i class="bi bi-type scale-125 opacity-50"></i></Input
				>
			</div>
			<div class="mt-3">
				<Input
					type="password"
					placeholder="Password"
					bind:value={password}
					highlightError={!!passwordError}
					errorMessage={passwordError}><i class="bi bi-key scale-125 opacity-50"></i></Input
				>
			</div>

			<div class="mt-2">
				<Button disabled={debounce} on:click={signin}>
					{#if debounce}
						<LoadingDots />
					{:else}
						Log in
					{/if}
				</Button>
			</div>
			<p class="mt-2">Don't have an account?</p>
			<a href="/register">Register</a>
		</form>
	</Modal>
</main>

<style lang="postcss">
	main {
		background-image: url('/wave.svg');
		background-repeat: no-repeat;
		background-size: cover;

		-webkit-overflow-scrolling: auto;
	}
</style>
