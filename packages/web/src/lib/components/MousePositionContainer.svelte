<script lang="ts">
	import { onMount } from 'svelte';

	const captureClass = 'capture-movement';

	const handleMove = (e: MouseEvent) => {
		const target: HTMLElement | null = (e.target as HTMLElement).classList.contains(captureClass)
			? (e.target as HTMLElement)
			: (e.target as HTMLElement)?.closest(`.${captureClass}`);

		if (!target) return;

		const rect = target.getBoundingClientRect(),
			x = e.clientX - rect.left,
			y = e.clientY - rect.top;

		target.style.setProperty('--tw-mouse-x', x + 'px');
		target.style.setProperty('--tw-mouse-y', y + 'px');
	};

	onMount(() => {
		const captureItems = document.querySelectorAll(`.${captureClass}`);

		const listeningItems: HTMLElement[] = [];

		for (const item of captureItems) {
			(item as HTMLElement).addEventListener('mousemove', handleMove);
			listeningItems.push(item as HTMLElement);
		}

		// Listen for new items
		const observer = new MutationObserver((mutationsList) => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					for (const node of mutation.addedNodes) {
						if (node instanceof HTMLElement) {
							node.addEventListener('mousemove', handleMove);
							listeningItems.push(node);
						}
					}
				}
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		return () => {
			for (const item of listeningItems) {
				(item as HTMLElement).removeEventListener('mousemove', handleMove);
			}

			observer.disconnect();
		};
	});
</script>

<div class="w-full h-screen absolute top-0 left-0 z-[10000] pointer-events-none"></div>
