<script lang="ts">
	export let type = '';
	export let placeholder = '';
	export let value: string;
	export let style = '';
	export let autocomplete = 'true';
	export let highlightError = false;
	export let errorMessage = '';

	export let change: (e: Event) => void = () => {};
	export let input: (e: Event) => void = () => {};

	export const id = `input-${type}-${Math.random()}`;

	let passwordVisible = false;

	const SLOTS = $$slots;

	const typeAction = (node: HTMLInputElement) => {
		node.type = type;
	};

	const togglePasswordVisibility = (e: Event) => {
		e.preventDefault();
		passwordVisible = !passwordVisible;
		const input = document.getElementById(id) as HTMLInputElement;
		input.type = passwordVisible ? 'text' : 'password';
	};
</script>

<div>
	{#if highlightError && errorMessage}
		<p class="text-red-500 m-0 mb-2 relative top-0 w-full max-w-[418px]">{errorMessage}</p>
	{/if}
	<label class="relative block w-full">
		<span class="sr-only">{type}</span>

		{#if SLOTS.default}
			<span
				class="absolute inset-y-0 left-0 flex items-center pl-3 pr-2.5 bg-background-700 rounded-l-full"
				><slot /></span
			>
		{/if}
		<input
			{autocomplete}
			{id}
			use:typeAction
			{placeholder}
			bind:value
			on:change={change}
			on:input={input}
			class="transition-all ease-in-out text-text-100 p-2 block w-full placeholder:text-text-400 px-4 bg-background-800 rounded-full outline-none focus:ring-2 focus:ring-background-400 {highlightError
				? 'focus:ring-red-500'
				: ''}"
			class:pl-12={!!SLOTS.default}
			name={id}
		/>
		{#if type === 'password'}
			<span class="h-[22px] absolute top-1/2 -translate-y-1/2 right-4 opacity-50"
				><button
					on:click={togglePasswordVisibility}
					class={`bi ${passwordVisible ? 'bi-eye' : 'bi-eye-slash'}`}
				></button></span
			>
		{/if}
	</label>
</div>
