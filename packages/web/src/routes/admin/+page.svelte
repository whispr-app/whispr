<script lang="ts">
	import Button from '$lib/components/Button.svelte';
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

	let username: string;
	let userResponseMessage: string = '';
	const banUser = async () => {
		const response = await libWhispr.banUser(username).catch();
		if (!response) return;

		if (response.status === 200) userResponseMessage = 'User banned';
		else userResponseMessage = response.data.message;

		console.log(response.data);
	};

	const unbanUser = async () => {
		const response = await libWhispr.unbanUser(username).catch();
		if (!response) return;

		if (response.status === 200) userResponseMessage = 'User unbanned';
		else userResponseMessage = response.data.message;

		console.log(response.data);
	};
</script>

<main class="text-text-100">
	<h1 class="text-3xl font-medium">Admin</h1>
	<a href="/channels/@self">App</a>
	<h2 class="text-2xl">KeyGen</h2>
	<form on:submit|preventDefault>
		<label for="nKeys"> Number of keys </label>
		<input class="text-black p-2" id="nKeys" type="number" bind:value={nKeys} />
		<label for="nUses"> Number of uses per key </label>
		<input class="text-black p-2" id="nUses" type="number" bind:value={numberOfUses} />
		<Button on:click={generateKeys}>Generate</Button>
	</form>
	<pre>
    {#each $keys as key}
			{key}<br />
		{/each}
  </pre>
	<h3 class="text-xl">Existing Keys</h3>
	<Button on:click={fetchKeys}>Fetch</Button>
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
							><Button
								on:click={() => {
									deleteKey(key.key).then(() => {
										fetchKeys();
									});
								}}><i class="bi bi-trash-fill danger"></i></Button
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	<h2 class="text-2xl">Users</h2>
	<form on:submit|preventDefault>
		<label for="username">Username</label>
		<input class="text-black p-2" bind:value={username} id="username" type="text" />
		<Button on:click={banUser} variant="danger">Ban</Button>
		<Button on:click={unbanUser} variant="danger">Unban</Button>
	</form>
	<p>{userResponseMessage}</p>
</main>

<style lang="postcss">
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 10px;
	}
	th,
	td {
		padding: 10px;
		margin: 0;
		border: 1px solid #ffffff;
	}
</style>
