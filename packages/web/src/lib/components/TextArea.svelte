<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();

	export let maxHeight = 300;

	export let value = '';

	let inputBox: HTMLTextAreaElement;
	let containerOuter: HTMLLabelElement;
	let containerInner: HTMLDivElement;

	const submit = () => {
		dispatch('submit', { value: inputBox.value });
		requestAnimationFrame(() => {
			inputBox.value = '';
			autoHeight();
		});
	};

	const autoHeight = () => {
		requestAnimationFrame(() => {
			if (inputBox.scrollHeight > maxHeight) {
				inputBox.style.overflowY = 'scroll';
				inputBox.style.height = `${maxHeight}px`;

				containerOuter.style.height = `${maxHeight + 16}px`;
				containerInner.style.height = `${maxHeight + 16}px`;
			} else {
				inputBox.style.overflowY = 'hidden';
				inputBox.style.height = 'auto';
				inputBox.style.height = `${inputBox.scrollHeight}px`;

				containerOuter.style.height = 'auto';
				containerOuter.style.height = `${inputBox.scrollHeight + 16}px`;
				containerInner.style.height = 'auto';
				containerInner.style.height = `${inputBox.scrollHeight + 16}px`;
			}
		});
	};

	const keyEvent = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			console.log('enter pressed', 'event.shiftKey', event.shiftKey);

			if (!event.shiftKey) {
				submit();

				event.preventDefault();
			}
		}
		autoHeight();
		console.log(JSON.stringify(inputBox.value));
	};

	onMount(() => {
		autoHeight();
	});
</script>

<label
	class="inline-flex flex-row justify-center items-center gap-2.5 w-full"
	bind:this={containerOuter}
>
	<span class="sr-only">Send a message</span>
	<div
		class="w-full block bg-background-800 pr-2 pl-3 py-2 overflow-hidden"
		style="border-radius: 1.25rem;"
		bind:this={containerInner}
	>
		<textarea
			on:keypress={keyEvent}
			on:keydown={keyEvent}
			on:paste={autoHeight}
			bind:this={inputBox}
			bind:value
			placeholder="Send a message"
			spellcheck="true"
			rows="1"
			class="text-text-100 placeholder:text-text-400 bg-transparent outline-none w-full h-full resize-none overflow-x-hidden scrollbar"
		/>
	</div>
	<span class="inset-y-0 flex items-center justify-start flex-col h-full">
		<button
			on:click={submit}
			class="h-10 aspect-square bg-background-800 p-2.5 rounded-full hover:bg-background-700 flex justify-center items-center"
		>
			<i class="bi bi-send text-text-400 mt-[3px]"></i>
		</button>
	</span>
</label>

<style lang="postcss">
	.scrollbar {
		scrollbar-width: thin;
		scrollbar-color: theme('colors.background.500') rgba(0, 0, 0, 0);
	}

	.scrollbar::-webkit-scrollbar {
		width: 14px;
		height: 14px;
	}

	.scrollbar::-webkit-scrollbar-thumb {
		background-color: theme('colors.background.500');
		border: 4px solid rgba(0, 0, 0, 0);
		background-clip: padding-box;
		border-radius: 9999px;
	}

	.scrollbar::-webkit-scrollbar-track {
		background-color: rgba(0, 0, 0, 0);
	}
</style>
