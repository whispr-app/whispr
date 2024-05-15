<script lang="ts">
	import WhisprLogoWhite from './whispr-logo-white.svelte';

	const version = PKG.version;
	const gitHash = GIT_HASH;
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
			<a target="_blank" href="https://github.com/whispr-app/whispr/commit/{gitHash.full}"
				>v{version} ({gitHash.short})</a
			>
		</div>
		<div>
			<h3>Information</h3>
			<p>Acknowledgments</p>
			<p>Licenses</p>
		</div>
	</div>
</footer>
