<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let maxHeight = 300;

	export let value = '';

	let inputBox: HTMLTextAreaElement;

	const submit = () => {
		dispatch('submit', { value: inputBox.value });
	};

	const autoHeight = () => {
		requestAnimationFrame(() => {
			if (inputBox.scrollHeight > maxHeight) {
				inputBox.style.overflowY = 'scroll';
				inputBox.style.height = `${maxHeight}px`;

				if (inputBox.parentElement) {
					inputBox.parentElement.style.height = `${maxHeight}px`;
				}
			} else {
				inputBox.style.overflowY = 'hidden';
				inputBox.style.height = 'auto';
				inputBox.style.height = `${inputBox.scrollHeight}px`;

				if (inputBox.parentElement) {
					inputBox.parentElement.style.height = 'auto';
					inputBox.parentElement.style.height = `${inputBox.scrollHeight}px`;
				}
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
</script>

<label class="inline-flex flex-row justify-center items-center gap-2.5 w-full">
	<span class="sr-only">Send a message</span>
	<textarea
		on:keypress={keyEvent}
		on:keydown={keyEvent}
		on:paste={autoHeight}
		bind:this={inputBox}
		bind:value
		placeholder="Send a message"
		spellcheck="true"
		rows="1"
		style="border-radius: 1.25rem;"
		class="text-text-100 p-2 block w-full placeholder:text-text-400 px-4 bg-background-800 outline-none resize-none overflow-hidden"
	/>
	<span class="inset-y-0 flex items-center justify-start flex-col h-full">
		<button
			on:click={submit}
			class="h-10 aspect-square bg-background-800 p-2.5 rounded-full hover:bg-background-700 flex justify-center items-center"
		>
			<i class="bi bi-send text-text-300 mt-[3px]"></i>
		</button>
	</span>
</label>
