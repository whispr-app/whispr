<script lang="ts">
	import { onMount } from 'svelte';
	let tooltip: string = 'test';
	let position: { x: number; y: number } = { x: 0, y: 0 };
	let scale: number = 0.9;
	let opacity: number = 0;
	let offset: { x: number; y: number; type: 'top' | 'bottom' | 'left' | 'right' } = {
		x: 0,
		y: 0,
		type: 'top'
	};

	let tooltipEl: HTMLDivElement;

	let animationId: number;
	const animateTooltip = (toOpacity: number, toScale: number, duration: number) => {
		return new Promise<void>((resolve) => {
			cancelAnimationFrame(animationId);
			const start = performance.now();
			const startOpacity = opacity,
				startScale = scale;
			const animate = () => {
				const elapsed = performance.now() - start;

				const progress = Math.min(elapsed / duration, 1);
				opacity = startOpacity + (toOpacity - startOpacity) * progress;
				scale = startScale + (toScale - startScale) * progress;
				if (progress < 1) animationId = requestAnimationFrame(animate);
				else resolve();
			};
			animationId = requestAnimationFrame(animate);
		});
	};

	const showTooltip = (event: MouseEvent, text: string) => {
		const target = (event.target as HTMLElement).hasAttribute('data-tooltip')
			? (event.target as HTMLElement)
			: ((event.target as HTMLElement).closest('[data-tooltip]') as HTMLElement);

		if (!target) return;
		const offsetType = target.dataset.tooltipOffset || 'top';
		tooltip = text;
		animateTooltip(1, 1, 100);

		requestAnimationFrame(() => {
			const rect = target.getBoundingClientRect();

			position = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

			switch (offsetType) {
				case 'top': {
					offset = {
						x: 0,
						y: -rect.height / 2 - 16 - tooltipEl.clientHeight / 2 + 5,
						type: 'top'
					};
					break;
				}
				case 'bottom': {
					offset = {
						x: 0,
						y: rect.height / 2 + 16 + tooltipEl.clientHeight / 2 - 5,
						type: 'bottom'
					};
					break;
				}
				case 'left': {
					offset = {
						x: -rect.width / 2 - 16 - tooltipEl.clientWidth / 2 + 5,
						y: 0,
						type: 'left'
					};
					break;
				}
				case 'right': {
					offset = {
						x: rect.width / 2 + 16 + tooltipEl.clientWidth / 2 - 5,
						y: 0,
						type: 'right'
					};
					break;
				}
			}
		});
	};

	const hideTooltip = () => {
		animateTooltip(0, 0.9, 100).then(() => {
			tooltip = '';
		});
	};

	onMount(() => {
		const items: HTMLElement[] = Array.from(document.querySelectorAll('[data-tooltip]'));
		for (const item of items) {
			const text = item.dataset.tooltip;
			if (!text) return;
			item.addEventListener('mouseenter', (e) => showTooltip(e, text));
			item.addEventListener('mouseleave', hideTooltip);
		}

		// Listen for new items
		const observer = new MutationObserver((mutationsList) => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					for (const node of mutation.addedNodes) {
						if (node instanceof HTMLElement) {
							const text = node.dataset.tooltip;
							if (!text) continue;
							node.addEventListener('mouseenter', (e) => showTooltip(e, text));
							node.addEventListener('mouseleave', hideTooltip);
							items.push(node);
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
			for (const item of items) {
				item.removeEventListener('mouseenter', (e) => showTooltip(e, item.dataset.tooltip || ''));
				item.removeEventListener('mouseleave', hideTooltip);
			}

			observer.disconnect();
		};
	});
</script>

<div class="w-full h-screen absolute top-0 left-0 z-[9999] pointer-events-none">
	<div
		bind:this={tooltipEl}
		class="absolute {offset.type} pointer-events-none whitespace-nowrap shadow-background-950 shadow-md pl-2 pr-2 pt-1 pb-1 bg-background-925 text-text-100 rounded-lg after:absolute after:border-8"
		style={`top: ${position.y + offset.y + window.scrollY}px; left: ${position.x + offset.x + window.scrollX}px; transform: translateX(-50%) translateY(-50%) scale(${scale}); opacity: ${opacity};`}
	>
		{tooltip}
	</div>
</div>

<style lang="postcss">
	.top::after {
		@apply top-[calc(100%-1px)] left-1/2 -ml-2 border-t-background-925 border-b-transparent border-l-transparent border-r-transparent;
	}
	.bottom::after {
		@apply bottom-[calc(100%-1px)] left-1/2 -ml-2 border-b-background-925 border-t-transparent border-l-transparent border-r-transparent;
	}
	.left::after {
		@apply top-1/2 -mt-2 left-[calc(100%-1px)] border-l-background-925 border-t-transparent border-b-transparent border-r-transparent;
	}
	.right::after {
		@apply top-1/2 -mt-2 right-[calc(100%-1px)] border-r-background-925 border-t-transparent border-b-transparent border-l-transparent;
	}
</style>
