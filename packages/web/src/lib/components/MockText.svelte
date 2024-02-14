<script lang="ts">
	export let style = '';
</script>

<div {style} class="outer"><div class="inner" /></div>

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;

	.outer {
		width: calc(100% - 6px);
		height: calc(100% - 6px);
		width: 100%;
		height: 100%;
		padding: 3px;
	}

	.inner {
		width: 100%;
		height: 100%;
		border-radius: 25px;
		background: colours.$text-100;
		background: linear-gradient(
			to right,
			colours.$text-100 2%,
			colours.$text-secondary-100 18%,
			colours.$text-100 33%
		);
		background-size: 1300px;
		animation: inner-bg 2s linear infinite forwards;
	}

	@keyframes inner-bg {
		0% {
			background-position: -650px 0;
		}
		100% {
			background-position: 650px 0;
		}
	}
</style>
