<script lang="ts">
	export let href = '';
</script>

<a {href}>
	<slot />
</a>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;

	a {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.5rem;

		text-decoration: none;

		background-color: colours.$button-100;
		color: colours.$text-100;
		border-radius: 8px;
		border: 1px solid colours.$outline-100;

		transition: border 0.2s ease-in-out;

		&:hover {
			border: 1px solid colours.$outline-highlighted-100;
			cursor: pointer;
		}
	}
</style>
