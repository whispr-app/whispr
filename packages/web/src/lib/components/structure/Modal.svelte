<div>
	<slot />
</div>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;
	@use 'lib/styles/zIndexes.scss' as zIndexes;

	div {
		// min-width: 450px;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		border-radius: 25px;
		border: 1px solid colours.$outline-100;
		background-color: colours.$background-tertiary-100;
		color: colours.$text-100;

		z-index: zIndexes.$modal;

		box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.3);

		padding: 25px;
		padding-left: 40px;
		padding-right: 40px;

		&::backdrop {
			background-color: colours.$background-50;
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
		}
	}

	@media (max-width: 768px) {
		div {
			scale: 0.8;
			margin: 0;
		}
	}
</style>
