<script lang="ts">
	import WhisprLogoWhite from './whispr-logo-white.svelte';
</script>

<footer>
	<div class="container">
		<div>
			<a href="/" class="logo">
				<WhisprLogoWhite />
			</a>
			<p>© 2023 Whispr</p>
		</div>
		<div>
			<h3>Product</h3>
			<a href="https://github.com/whispr-app/" target="_blank">GitHub</a>
		</div>
		<div>
			<h3>Information</h3>
			<p>Acknowledgments</p>
			<p>Licenses</p>
		</div>
	</div>
</footer>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;

	.logo {
		width: 10rem;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 !important;
	}

	footer {
		padding: 10px;
		height: 12rem;
		display: flex;
		justify-content: center;
		align-items: center;

		.container {
			display: flex;
			flex-direction: row;
			justify-content: space-evenly;
			align-items: top;

			* {
				text-align: center;
				display: block;
				margin: 10px;
			}
		}
	}

	@media screen and (max-width: 830px) {
		footer {
			flex-direction: column;
			height: auto;
		}
	}
</style>
