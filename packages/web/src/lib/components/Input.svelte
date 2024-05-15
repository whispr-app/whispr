<script lang="ts">
	export let type = '';
	export let placeholder = '';
	export let value: string;
	export let domain = '';
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

<div style="width: 100%;">
	{#if highlightError && errorMessage}
		<p class="error-message">{errorMessage}</p>
	{/if}
	<div class={`main ${highlightError && 'error'}`} {style}>
		{#if SLOTS.default}
			<div class="before">
				<slot />
			</div>
		{/if}
		<input
			{autocomplete}
			{id}
			use:typeAction
			{placeholder}
			bind:value
			on:change={change}
			on:input={input}
		/>
		{#if type === 'username' && domain}
			<span class="domain">@{domain}</span>
		{:else if type === 'password'}
			<span class="show-hide"
				><button
					on:click={togglePasswordVisibility}
					class={`bi ${passwordVisible ? 'bi-eye' : 'bi-eye-slash'}`}
				></button></span
			>
		{/if}
	</div>
</div>
