<script lang="ts">
	const randomWidth = () => Math.floor(Math.random() * 100) + 50;
</script>

<div
	style="width: {randomWidth()}px;"
	class={`h-4 animate-pulse bg-background-300 rounded-full m-0.5`}
></div>
