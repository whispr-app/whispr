<div class="gradient-text">
	<slot />
</div>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;

	.gradient-text {
		background: linear-gradient(90deg, #4c8bf5 0%, #81afff 50%, #4c8bf5 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		display: inline-block;

		background-size: 200%;

		animation: gradient 5s linear infinite;

		transition: text-shadow 0.2s ease-in-out;

		&:hover {
			text-shadow: 0 0 20px #4c8af57c;
		}
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
