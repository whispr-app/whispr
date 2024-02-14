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

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;

	.error {
		border: 1px solid colours.$error-100 !important;

		.before {
			border-right: 1px solid colours.$error-100 !important;
		}
	}

	.error-message {
		color: colours.$error-100;
		margin: 0;
		margin-bottom: 0.5rem;
		position: relative;
		top: 0px;
		width: 100%;
		max-width: 418px;
	}

	.main {
		padding: 0.5rem;
		box-sizing: content-box;

		display: flex;
		align-items: center;

		border-radius: 8px;
		border: 1px solid colours.$outline-100;
		background-color: colours.$background-tertiary-100;

		transition: border 0.2s ease-in-out;

		height: 25px;

		&:focus-within {
			border: 1px solid colours.$outline-highlighted-100;

			.before {
				border-right: 1px solid colours.$outline-highlighted-100;
			}
		}

		.before {
			display: inline-flex;
			justify-content: center;
			align-items: center;
			position: relative;
			left: 0;
			margin: -0.5rem;
			margin-right: 0.25rem;
			padding: 0.5rem;
			height: 100%;
			aspect-ratio: 1;
			background-color: colours.$button-100;

			border-radius: 7px 0 0 7px;
			border-right: 1px solid colours.$outline-100;
			transition: border 0.2s ease-in-out;
		}

		.domain {
			opacity: 0.5;
			height: 22px;
			display: inline;
			align-items: center;
			position: relative;
			top: 2px;
			margin-right: 5px;
		}

		.show-hide {
			position: relative;
			top: 1px;
			opacity: 0.5;
			cursor: pointer;

			button {
				background: none;
				border: none;
				outline: none;
				color: colours.$text-100;
				font-size: large;
			}
		}
	}

	input {
		margin: 0;
		padding: 0;
		margin-left: 5px;
		color: colours.$text-100;

		display: inline-block;
		width: 100%;

		outline: none;
		background: none;
		border: none;

		font-size: large;

		&::placeholder {
			color: colours.$text-50;
		}
	}
</style>
