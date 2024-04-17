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

	let fetchedKeys = writable<
		{
			createdAt: string;
			key: string;
			numberOfUses: number;
			users: { username: string; id: number }[];
		}[]
	>([]);

	const fetchKeys = async () => {
		const response = await libWhispr.fetchKeys();
		if (!response) return;

		console.log(response.data);

		fetchedKeys.set(response.data.keys);
	};

	const deleteKey = async (key: string) => {
		const response = await libWhispr.deleteKey(key);
		if (!response) return;

		console.log(response.data);

		fetchKeys();
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
	<h3>Existing Keys</h3>
	<button on:click={fetchKeys}>Fetch</button>
	{#if $fetchedKeys.length > 0}
		<table>
			<thead>
				<tr>
					<th>Key</th>
					<th>Uses left</th>
					<th>Created At</th>
					<th>Users</th>
					<th>Delete</th>
				</tr>
			</thead>
			<tbody>
				{#each $fetchedKeys as key}
					<tr>
						<td>{key.key}</td>
						<td>{key.numberOfUses}</td>
						<td
							>{new Date(key.createdAt).toLocaleDateString()} @ {new Date(
								key.createdAt
							).toLocaleTimeString()}</td
						>
						<td>
							<table style="margin: 0;">
								<thead>
									<tr>
										<th>Username</th>
										<th>ID</th>
									</tr>
								</thead>
								<tbody>
									{#each key.users as user}
										<tr>
											<td>{user.username}</td>
											<td>{user.id}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</td>
						<td
							><button
								on:click={() => {
									deleteKey(key.key).then(() => {
										fetchKeys();
									});
								}}><i class="bi bi-trash-fill danger"></i></button
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</main>

<style lang="scss">
	@use 'lib/styles/colours' as colours;

	.danger {
		color: colours.$error-100;
	}

	main {
		padding: 20px;
	}

	pre {
		white-space: normal;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin: 10px;

		th,
		td {
			padding: 10px;
			margin: 0;
			border: 1px solid #475466;
		}
	}
</style>
