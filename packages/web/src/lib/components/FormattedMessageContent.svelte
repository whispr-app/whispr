<script lang="ts">
	import { TokenType, lex } from '$lib/messageContentLexer';
	import Placeholder from './Placeholder.svelte';

	export let content: string;
</script>

{#await lex(content)}
	<Placeholder></Placeholder>
{:then tokens}
	{#each tokens as token}
		{#if token.type === TokenType.TEXT}
			{token.value}
		{:else if token.type === TokenType.EMOJI}
			<i data-tooltip={`:${token.value}:`} class="twa twa-{token.value}"></i>
		{/if}
	{/each}
{:catch error}
	<p>{error.message}</p>
{/await}
