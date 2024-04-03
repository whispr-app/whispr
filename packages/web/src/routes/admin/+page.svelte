<script lang="ts">
	import { authedUser, libWhispr } from '$lib/libWhispr';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	if (!authedUser) {
		window.location.href = '/login';
	}

	onMount(async () => {
		const isAuthorised = await libWhispr.isAuthorised().catch((e) => {
			window.location.href = '/';
		});
		console.log(isAuthorised);

		if (!isAuthorised) {
			window.location.href = '/';
		}
	});

	let nKeys = 1;
	let numberOfUses = 1;
	let keys = writable<string[]>([]);

	const generateKeys = async () => {
		const keysResponse = await libWhispr.generateKeys(nKeys, numberOfUses);

		if (!keysResponse) return;

		console.log(keysResponse.data);

		const _keys: string[] = [];

		if (keysResponse.data) {
			keysResponse.data.keys.forEach((key: string) => {
				_keys.push(key);
			});
		}
		keys.set(_keys);
	};
</script>

<main>
	<h1>Admin</h1>
	<h2>KeyGen</h2>
	<form on:submit|preventDefault={generateKeys}>
		<label for="nKeys"> Number of keys </label>
		<input id="nKeys" type="number" bind:value={nKeys} />
		<label for="nUses"> Number of uses per key </label>
		<input id="nUses" type="number" bind:value={numberOfUses} />
		<button type="submit">Generate</button>
	</form>
	<pre>
    {#each $keys as key}
			{key}<br />
		{/each}
  </pre>
</main>

<style lang="scss">
	main {
		padding: 20px;
	}

	pre {
		white-space: normal;
	}
</style>
