<script lang="ts">
	import WhisprLogoWhite from './whispr-logo-white.svelte';

	const version = PKG.version;
	const gitHash = GIT_HASH;
</script>

<footer class="p-3 h-48 flex justify-center items-start">
	<div class="flex flex-row justify-evenly items-start">
		<div class="text-center block m-3">
			<a href="/" class="w-40 h-full flex justify-center items-center">
				<WhisprLogoWhite />
			</a>
		</div>
		<div class="text-center block m-3">
			<h3 class="text-text-100">Product</h3>
			<a href="https://github.com/whispr-app/" target="_blank">GitHub</a>
			<a target="_blank" href="https://github.com/whispr-app/whispr/commit/{gitHash.full}"
				>v{version} ({gitHash.short})</a
			>
		</div>
		<div class="text-center block m-3">
			<h3 class="text-text-100">Information</h3>
			<a href="/#">Acknowledgments</a>
			<a href="/#">Licenses</a>
		</div>
	</div>
</footer>
