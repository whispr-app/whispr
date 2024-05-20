<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { libWhispr, authedUser } from '$lib/libWhispr';
	import axios, { AxiosError } from 'axios';
	import { onMount } from 'svelte';
	import MousePositionContainer from '$lib/components/MousePositionContainer.svelte';

	onMount(async () => {
		const emojiCss = await fetch(
			'https://cdn.jsdelivr.net/gh/iamludal/twemoji-awesome@1.1/twemoji-awesome.min.css'
		).then((res) => res.text());
		const emojis =
			emojiCss
				.match(/(?<=\.twa-)[A-Za-z-]+(?=,|:|{| )/gm)
				?.filter((e) => !['lg', '2x', '3x', '4x', '5x', ''].includes(e)) || [];
		window.emojis = emojis;
	});

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
</script>

<MousePositionContainer></MousePositionContainer>
<slot />

<style lang="postcss">
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
	@import url('https://cdn.jsdelivr.net/gh/iamludal/twemoji-awesome@1.1/twemoji-awesome.min.css');

	:global(:root) {
		--linearPrimarySecondary: linear-gradient(#6a42ec, #a791ed);
		--linearPrimaryAccent: linear-gradient(#6a42ec, #4252ed);
		--linearSecondaryAccent: linear-gradient(#a791ed, #4252ed);
		--radialPrimarySecondary: radial-gradient(#6a42ec, #a791ed);
		--radialPrimaryAccent: radial-gradient(#6a42ec, #4252ed);
		--radialSecondaryAccent: radial-gradient(#a791ed, #4252ed);
	}

	:global(html) {
		font-family: 'Montserrat', sans-serif;
		font-optical-sizing: auto;
		font-weight: 400;
		font-style: normal;
		ascent-override: 90%;
		background-color: theme('colors.background.950');
	}

	:global(body) {
		background-color: theme('colors.background.950');
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Commissioner', sans-serif;
	}

	:global(*)::selection {
		color: theme('colors.text.100');
		background-color: theme('colors.primary.600');
	}

	:global(*)::-moz-selection {
		color: theme('colors.text.100');
		background-color: theme('colors.primary.600');
	}

	:global(h1) {
		font-weight: 500;
		font-stretch: 125%;
		font-variation-settings:
			'slnt' 0,
			'FLAR' 100,
			'VOLM' 0;
	}
	:global(h2) {
		font-weight: 300;
		font-stretch: 125%;
		font-variation-settings:
			'slnt' 0,
			'FLAR' 100,
			'VOLM' 0;
	}

	:global(a) {
		color: theme('colors.primary.500');
		display: block;
	}
	:global(a):hover {
		text-decoration-line: underline;
	}

	:global(*) {
		scrollbar-width: thin;
		scrollbar-color: theme('colors.background.800') rgba(0, 0, 0, 0);
	}

	:global(*)::-webkit-scrollbar {
		width: 14px;
		height: 14px;
	}

	:global(*)::-webkit-scrollbar-thumb {
		background-color: theme('colors.background.800');
		border: 4px solid rgba(0, 0, 0, 0);
		background-clip: padding-box;
		border-radius: 9999px;
	}

	:global(*)::-webkit-scrollbar-track {
		background-color: rgba(0, 0, 0, 0);
	}
</style>
