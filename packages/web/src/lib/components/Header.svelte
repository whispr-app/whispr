<script lang="ts">
	import WhisprLogoWhite from './whispr-logo-white.svelte';
	import AnchorButton from './AnchorButton.svelte';
	import { goto } from '$app/navigation';
	import { authedUser } from '$lib/libWhispr';
</script>

<header>
	<a href="/" class="logo">
		<WhisprLogoWhite />
	</a>
	{#if $authedUser}
		<div class="options">
			<AnchorButton href="/channels/@self">Go To App</AnchorButton>
		</div>
	{:else}
		<div class="options">
			<AnchorButton href="/register">Register</AnchorButton>
			<AnchorButton href="/login">Login</AnchorButton>
		</div>
	{/if}
</header>
