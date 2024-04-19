<script lang="ts">
	import { goto } from '$app/navigation';
	import WhisprLogoWhite from '$lib/components/whispr-logo-white.svelte';
	import { libWhispr, authedUser } from '$lib/libWhispr';
	import axios, { AxiosError } from 'axios';

	axios.interceptors.request.use((config) => {
		if ($authedUser) config.headers['Authorization'] = `Bearer ${$authedUser.token}`;
		return config;
	});

	axios.interceptors.response.use(
		(response) => response,
		async (error) => {
			console.log(error);
			console.log(error.response?.status, error.response?.data?.message);

			if (
				error.response?.status === 401 &&
				!error.config.url?.includes('/auth/sign-out') &&
				error.response?.data?.message === 'Invalid token'
			) {
				try {
					await libWhispr.signout();
				} catch {}
				goto('/login');
			}
			if (error.config.url?.includes('/auth/sign-out')) {
				libWhispr.authStore = null;
				authedUser.set(null);
				goto('/login');
			}
			return Promise.reject(error);
		}
	);

	// const signout = async () => {
	// 	try {
	// 		await libWhispr.signout();
	// 		goto('/');
	// 		window.location.reload();
	// 	} catch (e) {
	// 		if (e instanceof AxiosError) {
	// 			error = e.response?.data?.message || e.message;
	// 		}
	// 		return;
	// 	}
	// };
</script>

<!-- <div class="no-mobile">
	<div>
		<WhisprLogoWhite />
	</div>
	<h1>Mobile currently isn't supported.</h1>
	<h2>Feel free to have a look on a desktop.</h2>
</div> -->

<div class="wrapper">
	<slot />
</div>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

	@font-face {
		font-family: 'Mona Sans';
		src:
			url('$lib/Mona-Sans.woff2') format('woff2 supports variations'),
			url('$lib/Mona-Sans.woff2') format('woff2-variations');
		font-weight: 200 900;
		font-stretch: 75% 125%;
	}

	.wrapper {
		position: absolute;
		left: 0;
		width: 100%;
		bottom: 0;
		height: 100%;
	}

	// @media (min-width: 768px) {
	// 	.PWA-mobile-wrapper {
	// 		bottom: 15px;
	// 		height: calc(100% - 15px);
	// 	}
	// }

	:global(html),
	:global(body) {
		overscroll-behavior-y: none;
	}

	:global(html) {
		font-family: 'Mona Sans';
		padding: 0;
		margin: 0;
	}

	:global(body) {
		padding: 0;
		margin: 0;
		width: 100%;
		height: 100%;
		background-color: colours.$background-100;
		color: colours.$text-100;
	}

	:global(a) {
		color: colours.$primary-100;
	}

	:global(*) {
		font-weight: 300;
		font-stretch: 100%;
		scrollbar-color: colours.$text-secondary-100 colours.$background-0;
		scrollbar-width: thin;
	}
	:global(h1) {
		font-weight: 800;
		font-stretch: 125%;
	}
	:global(h2) {
		font-weight: 500;
		font-stretch: 125%;
	}

	:global(.icon) {
		scale: 1.5;
		width: 100%;
		height: 100%;
		display: inline-block;
		// justify-content: center;
		// align-items: center;
		// text-align: center;
		vertical-align: middle;

		&::before {
			vertical-align: -5px;
		}
	}

	:global(button) {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.5rem;

		font-weight: 500;
		font-size: large;
		width: fit-content;

		background-color: colours.$button-100;
		color: colours.$text-100;
		border-radius: 8px;
		border: 1px solid colours.$outline-100;

		transition: border 0.2s ease-in-out;

		&:hover {
			border: 1px solid colours.$outline-highlighted-100;
			cursor: pointer;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	:global(.button-primary) {
		color: colours.$text-100;
		background-color: colours.$primary-100;
		border: 1px solid colours.$primary-100;

		&:hover {
			border: 1px solid colours.$text-100;
		}
	}

	:global(.button-danger) {
		color: colours.$error-100;
		background-color: colours.$background-secondary-100;

		&:hover {
			border: 1px solid colours.$error-100;
		}
	}

	:global(.text-secondary) {
		color: colours.$text-secondary-100;
	}
</style>
