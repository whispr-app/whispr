<script lang="ts">
	import WhisprLogoWhite from './whispr-logo-white.svelte';
	import AnchorButton from './AnchorButton.svelte';
	import { goto } from '$app/navigation';
</script>

<header>
	<a href="/" class="logo">
		<WhisprLogoWhite />
	</a>
	<div class="options">
		<AnchorButton href="/register">Register</AnchorButton>
		<AnchorButton href="/login">Login</AnchorButton>
	</div>
</header>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;

	.logo {
		width: 10rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.options {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		box-sizing: border-box;
		height: 4rem;
		width: 100%;
		margin: 0;
		background-color: colours.$background-secondary-50;
		color: colours.$text-100;
		position: sticky;
		backdrop-filter: blur(10px);
		top: 0;
	}
</style>
