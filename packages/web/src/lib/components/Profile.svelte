<script lang="ts">
	import { libWhispr } from '$lib/libWhispr';
	export let nickname: string = '';
	export let status: 'online' | 'idle' | 'dnd' | 'offline' = 'offline';
</script>

{#await libWhispr.generateProfilePictureUrl(nickname) then url}
	<div class="relative h-10 w-10">
		<img draggable="false" src={url} alt={nickname} height="100%" />
		<div
			data-tooltip={`${status.substring(0, 1).toUpperCase()}${status.substring(1)}`}
			class="absolute bottom-[1.90253639647px] right-[1.90253639647px] w-2 h-2 rounded-full bg-gray-600"
			class:online={status === 'online'}
			class:idle={status === 'idle'}
			class:dnd={status === 'dnd'}
		></div>
	</div>
{/await}

<style lang="postcss">
	.online {
		background-color: theme('colors.green.500');
	}

	.idle {
		background-color: theme('colors.yellow.500');
	}

	.dnd {
		background-color: theme('colors.red.500');
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
