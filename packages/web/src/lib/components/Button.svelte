<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
	export let disabled = false;
</script>

<button
	{disabled}
	on:click={() => dispatch('click')}
	class={`transition-shadow duration-200 active:shadow-lg active:disabled:shadow-none text-text-100 p-2 rounded-full pl-3.5 pr-3.5 capture-movement disabled:hover:bg-none ${variant === 'primary' ? 'bg-primary-600 active:shadow-primary-800 hover:bg-radient-circle-pos from-primary-500 to-primary-600 from-0% to-70% disabled:bg-primary-700 disabled:text-background-400' : variant === 'secondary' ? 'bg-background-700 active:shadow-background-800 hover:bg-radient-circle-pos from-background-600 to-background-700 from-0% to-70% disabled:bg-background-700 disabled:text-background-400' : 'bg-red-600 active:shadow-red-800 hover:bg-radient-circle-pos from-red-500 to-red-600 from-0% to-70% disabled:bg-red-700 disabled:text-red-300'} disabled:cursor-not-allowed`}
	><slot /></button
>
