<script lang="ts">
	export let maxWidth = 100;
	const randomWidth = () => Math.floor(Math.random() * 100) + 50;
</script>

<div
	style="width: {randomWidth()}px; max-width: {maxWidth}px;"
	class={`h-4 animate-pulse bg-background-300 rounded-full m-0.5`}
></div>
