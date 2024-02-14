<script lang="ts">
	import { goto } from '$app/navigation';
	import Input from '$lib/components/Input.svelte';
	import Modal from '$lib/components/structure/Modal.svelte';
	import WhisprLogoWhite from '$lib/components/whispr-logo-white.svelte';
	import LoadingDots from '$lib/components/LoadingDots.svelte';
	import { libWhispr, authedUser } from '$lib/libWhispr';
	import { AxiosError } from 'axios';
	import { browser } from '$app/environment';

	if ($authedUser) {
		browser && goto('/channels/@self');
	}

	const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

	let username = '';
	let password = '';
	let passwordConfirm = '';
	let nickname = '';

	let debounce = false;
	let errorMessage = '';

	let usernameError = '';
	let passwordError = '';
	let passwordConfirmError = '';
	let nicknameError = '';

	const passwordCheck = (pwd: string): true | string => {
		if (pwd.length < 12) return 'Password length must be at least 12 characters';
		if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
		if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
		if (pwd.length < 16) {
			if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
			if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd))
				return 'Password must contain at least one special character';
		}
		return true;
	};

	const register = async (e: Event) => {
		debounce = true;
		usernameError = '';
		passwordError = '';
		passwordConfirmError = '';
		nicknameError = '';
		errorMessage = '';

		let canSubmit = true;

		if (!username) {
			usernameError = 'Username is required';
			e.preventDefault();
			canSubmit = false;
		}
		if (!usernameRegex.test(username)) {
			usernameError =
				'Username must be between 3 and 20 characters and contain only letters, numbers, underscores and hyphens';
			e.preventDefault();
			canSubmit = false;
		}
		if (!password) {
			passwordError = 'Password is required';
			e.preventDefault();
			canSubmit = false;
		}
		const passwordCheckResult = passwordCheck(password);
		if (passwordCheckResult !== true) {
			passwordError = passwordCheckResult;
			e.preventDefault();
			canSubmit = false;
		}
		if (password !== passwordConfirm) {
			passwordConfirmError = 'Passwords do not match';
			e.preventDefault();
			canSubmit = false;
		}

		if (!nickname) {
			nicknameError = 'Nickname is required';
			e.preventDefault();
			canSubmit = false;
		}

		if (!canSubmit) {
			debounce = false;
			return;
		}

		try {
			const response = await libWhispr.register(password, nickname, username);

			if (response.status !== 201) {
				if (response.data.message) {
					usernameError = response.data.message;
				}
				return;
			}

			goto('/channels/@self');
			(e.target as HTMLFormElement).reset();
		} catch (e) {
			if (e instanceof AxiosError) {
				if (e.code === 'ECONNABORTED') {
					errorMessage = 'Request timed out';
				} else if (e.code === 'ERR_NETWORK') {
					errorMessage = 'Network error. Try again later';
				}
				if (e.response?.data?.message) {
					usernameError = e.response.data.message;
				}
			}
		}
		debounce = false;
	};
</script>

<svelte:head>
	<title>Register - Whispr</title>
</svelte:head>

<main>
	<div class="logo">
		<WhisprLogoWhite />
	</div>
	<Modal>
		<form on:submit|preventDefault={register}>
			<h1>Register</h1>
			{#if errorMessage}
				<p class="error-message">{errorMessage}</p>
			{/if}
			<p>Create some credentials</p>
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
					} else if (!usernameRegex.test(username)) {
						usernameError =
							'Username must be between 3 and 20 characters and contain only letters, numbers, underscores and hyphens';
					}
				}}
				domain={(browser && window.location.hostname) || ''}><i class="bi bi-type icon"></i></Input
			>
			<Input
				type="password"
				placeholder="Password"
				bind:value={password}
				change={() => {
					passwordError = '';
					const passwordCheckResult = passwordCheck(password);
					if (passwordCheckResult !== true) {
						passwordError = passwordCheckResult;
					}
				}}
				highlightError={!!passwordError || !!passwordConfirmError}
				errorMessage={passwordError}><i class="bi bi-key icon"></i></Input
			>
			<Input
				type="password"
				placeholder="Confirm Password"
				bind:value={passwordConfirm}
				change={() => {
					passwordConfirmError = '';
					if (password !== passwordConfirm) {
						passwordConfirmError = 'Passwords do not match';
					}
				}}
				highlightError={!!passwordConfirmError}
				errorMessage={passwordConfirmError}><i class="bi bi-key icon"></i></Input
			>
			<p>What do you call yourself?</p>
			<Input
				type="text"
				placeholder="Nickname"
				bind:value={nickname}
				highlightError={!!nicknameError}
				errorMessage={nicknameError}><i class="bi bi-type icon"></i></Input
			>
			<button disabled={debounce} type="submit">
				{#if debounce}
					<LoadingDots />
				{:else}
					Register
				{/if}
			</button>
			<p>Already have an account?</p>
			<a href="/login">Login</a>
		</form>
	</Modal>
</main>

<style lang="scss">
	@use 'lib/styles/colours' as colours;

	h1,
	p,
	a {
		margin: 0;
	}
	main {
		width: 100vw;
		height: 100vh;
		background-image: url('/wave.svg');
		background-repeat: no-repeat;
		background-size: cover;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button {
		width: 100%;
	}

	form {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		* {
			text-align: center;
		}
	}

	.error-message {
		color: colours.$error-100;
		margin: 0;
		margin-bottom: 0.5rem;
		position: relative;
		top: 0px;
		width: 100%;
		max-width: 418px;
	}

	.logo {
		width: 150px;
		position: absolute;
		bottom: 0;
		left: 10px;
	}
</style>
