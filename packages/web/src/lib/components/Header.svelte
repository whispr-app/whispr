<script lang="ts">
	import WhisprLogoWhite from './whispr-logo-white.svelte';
	import AnchorButton from './AnchorButton.svelte';
	import { goto } from '$app/navigation';
	import { authedUser } from '$lib/libWhispr';
</script>

<nav
	class="flex justify-between items-center pt-2 pb-2 pl-4 pr-4 box-border h-16 w-full m-0 text-text-100 sticky top-0"
>
	<div
		class="w-full h-24 absolute top-0 left-0 backdrop-blur-lg z-1 blur-mask bg-background-950 bg-opacity-5"
	></div>
	<div class="relative w-full z-5 p-3 flex justify-between">
		<a href="/" class="w-40 h-full flex justify-center items-center">
			<WhisprLogoWhite />
		</a>
		<div class="flex justify-evenly items-center gap-4">
			{#if $authedUser}
				<AnchorButton href="/channels/@self">Go To App</AnchorButton>
			{:else}
				<AnchorButton href="/register">Register</AnchorButton>
				<AnchorButton variant="secondary" href="/login">Login</AnchorButton>
			{/if}
		</div>
	</div>
</nav>

<style lang="postcss">
	:global(html) {
		background-color: theme('colors.gray.900');
	}

	:global(body) {
		position: relative;
	}

	.blur-mask {
		mask-image: linear-gradient(rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0.8) 70%, rgba(0, 0, 0, 0) 100%);

		-webkit-mask-image: linear-gradient(
			rgb(0, 0, 0) 50%,
			rgba(0, 0, 0, 0.8) 70%,
			rgba(0, 0, 0, 0) 100%
		);
		inset: -1rem 0;
	}
</style>
