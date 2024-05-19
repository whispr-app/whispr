<script lang="ts">
	import { goto } from '$app/navigation';
	import Input from '$lib/components/Input.svelte';
	import Modal from '$lib/components/structure/Modal.svelte';
	import WhisprLogoWhite from '$lib/components/whispr-logo-white.svelte';
	import Typing from '$lib/components/Typing.svelte';
	import { libWhispr, authedUser } from '$lib/libWhispr';
	import { AxiosError } from 'axios';
	import { browser } from '$app/environment';
	import Button from '$lib/components/Button.svelte';

	if ($authedUser) {
		browser && goto('/channels/@self');
	}

	const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

	let accessKey = '';
	let username = '';
	let password = '';
	let passwordConfirm = '';
	let nickname = '';

	let debounce = false;
	let errorMessage = '';

	let accessKeyError = '';
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
		accessKeyError = '';
		usernameError = '';
		passwordError = '';
		passwordConfirmError = '';
		nicknameError = '';
		errorMessage = '';

		let canSubmit = true;

		if (!accessKey) {
			accessKeyError = 'Access key is required at this time.';
			e.preventDefault();
			canSubmit = false;
		}

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
			const response = await libWhispr.register(password, nickname, username, accessKey);

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
					if (e.response?.data?.message.includes('Key')) accessKeyError = e.response?.data?.message;
					else usernameError = e.response.data.message;
				}
			}
		}
		debounce = false;
	};
</script>

<svelte:head>
	<title>Register - Whispr</title>
</svelte:head>

<main class="w-vw h-dvh overflow-hidden flex justify-center items-center">
	<div class="w-40 flex justify-center items-center absolute bottom-0 left-2.5">
		<WhisprLogoWhite />
	</div>
	<Modal>
		<form
			class="flex flex-col justify-center items-center text-center gap-4"
			on:submit|preventDefault
		>
			<h1 class="text-3xl">Register</h1>
			{#if errorMessage}
				<p class="text-red-500 m-0 mb-2 relative top-0 w-full max-w-[418px]">{errorMessage}</p>
			{/if}
			<Input
				type="text"
				placeholder="Access Key"
				bind:value={accessKey}
				highlightError={!!accessKeyError}
				errorMessage={accessKeyError}
				change={() => {
					accessKeyError = '';
					if (accessKey === '') {
						accessKeyError = 'Access key is required at this time.';
					}
				}}><i class="bi bi-123 scale-125 opacity-50"></i></Input
			>
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
				}}><i class="bi bi-type scale-125 opacity-50"></i></Input
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
				errorMessage={passwordError}><i class="bi bi-key scale-125 opacity-50"></i></Input
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
				errorMessage={passwordConfirmError}><i class="bi bi-key scale-125 opacity-50"></i></Input
			>
			<p>What do you call yourself?</p>
			<Input
				type="text"
				placeholder="Nickname"
				bind:value={nickname}
				highlightError={!!nicknameError}
				errorMessage={nicknameError}><i class="bi bi-type scale-125 opacity-50"></i></Input
			>
			<Button disabled={debounce} on:click={register}>
				{#if debounce}
					<div class="m-1"><Typing></Typing></div>
				{:else}
					Register
				{/if}
			</Button>
			<div>
				<p>Already have an account?</p>
				<a href="/login">Login</a>
			</div>
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
