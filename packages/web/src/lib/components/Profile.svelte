<script lang="ts">
	import { libWhispr } from '$lib/libWhispr';
	export let nickname: string = '';
	export let status: 'online' | 'idle' | 'dnd' | 'offline' = 'offline';
</script>

{#await libWhispr.generateProfilePictureUrl(nickname) then url}
	<div class="container">
		<img draggable="false" src={url} alt={nickname} height="100%" />
		<div
			class="status"
			class:online={status === 'online'}
			class:idle={status === 'idle'}
			class:dnd={status === 'dnd'}
		></div>
	</div>
{/await}

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;

	.container {
		position: relative;
		height: 40px;
		width: 40px;
	}

	.status {
		position: absolute;
		bottom: 1.90253639647px;
		right: 1.90253639647px;
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;
		background-color: colours.$outline-highlighted-100;
	}

	.online {
		background-color: colours.$success-100;
	}

	.idle {
		background-color: colours.$warning-100;
	}

	.dnd {
		background-color: colours.$error-100;
	}

	img {
		mask-image: url('/profile_mask.svg');
		height: 100%;
		aspect-ratio: 1;
		mask-mode: alpha;
		mask-repeat: no-repeat;
		mask-size: cover;
	}
</style>
