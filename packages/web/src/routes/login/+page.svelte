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

<main>
	<div class="logo">
		<WhisprLogoWhite />
	</div>
	<Modal>
		<form on:submit|preventDefault={signin}>
			<h1>Log in</h1>
			{#if errorMessage}
				<p class="error-message">{errorMessage}</p>
			{/if}
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
				}}
				domain={(browser && window.location.hostname) || ''}><i class="bi bi-type icon"></i></Input
			>
			<Input
				type="password"
				placeholder="Password"
				bind:value={password}
				highlightError={!!passwordError}
				errorMessage={passwordError}><i class="bi bi-key icon"></i></Input
			>
			<button disabled={debounce} type="submit">
				{#if debounce}
					<LoadingDots />
				{:else}
					Log in
				{/if}
			</button>
			<p>Don't have an account?</p>
			<a href="/register">Register</a>
		</form>
	</Modal>
</main>
