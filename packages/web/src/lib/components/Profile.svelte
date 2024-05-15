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
