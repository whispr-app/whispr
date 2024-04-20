<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import GradientText from '$lib/components/GradientText.svelte';
	import Message from '$lib/components/Message.svelte';
	import EncryptedText from '$lib/components/EncryptedText.svelte';
	import AnchorButton from '$lib/components/AnchorButton.svelte';
	import WhisprLogoWhite from '$lib/components/whispr-logo-white.svelte';
	import Footer from '$lib/components/Footer.svelte';

	import { browser } from '$app/environment';

	let dismissedWarning = Boolean(browser && localStorage.getItem('dismissedWarning'));
</script>

<svelte:head>
	<title>Home - Whispr</title>
</svelte:head>

<Header />
{#if !dismissedWarning}
	<div class="warning">
		⚠️ WARNING! Whispr is currently in development and very much in an unfinished state. Data is
		subject to be wiped and you shouldn't rely on this for secure communication yet.
		<span>
			<button
				on:click={() => {
					localStorage.setItem('dismissedWarning', 'true');
					dismissedWarning = true;
				}}><i class="bi bi-x-lg"></i></button
			>
		</span>
	</div>
{/if}
<section>
	<h1>Privacy that just <GradientText><h1>makes sense.</h1></GradientText></h1>
	<h2>Scroll down to find out more.</h2>
</section>
<section>
	<div style="gap: 20px;">
		<div class="encrypted-messages" style="display: flex; flex-direction: column;">
			<Message sentByMe={false} groupMessage={false}
				><div style="margin: 10px;"><EncryptedText length={20} /></div></Message
			>
			<Message sentByMe={true} groupMessage={false}
				><div style="margin: 10px;"><EncryptedText length={20} /></div></Message
			>
		</div>
		<div>
			<h1>Say <GradientText>what you want</GradientText></h1>
			<h2>with end-to-end encrypted messages.</h2>
		</div>
	</div>
</section>
<section>
	<div style="gap: 70px;">
		<div>
			<h1>Keep your identity <GradientText>private.</GradientText></h1>
			<h2>
				<span style="font-variation-settings: 'wdth' 125, 'wght' 200">Whispr</span> is anonymous
				<br /> and decentralised to protect your privacy.
			</h2>
		</div>
		<div>
			<img src="/profile.svg" alt="profile" width="200px" style="filter: blur(10px);" />
		</div>
	</div>
</section>
<Footer />

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;
	@use 'lib/styles/textSize.scss' as textSize;

	.warning {
		color: colours.$warning-100;
		padding: 1rem;
		text-align: center;

		span {
			display: inline-block;
		}

		button {
			background: none;
			border: none;
			cursor: pointer;
		}
	}

	h1 {
		font-size: textSize.$largest;
		margin: 0;
	}

	section {
		border-top: 1px solid colours.$outline-100;
		border-bottom: solid 1px colours.$outline-100;
		padding: 2rem;
		padding-top: 14rem;
		padding-bottom: 14rem;
		box-sizing: border-box;
		width: 100%;

		> div {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
		}
	}

	.encrypted-messages {
		width: 400px;
	}

	@media screen and (max-width: 830px) {
		section {
			// padding-top: 8rem;
			// padding-bottom: 8rem;

			> div {
				flex-direction: column;
			}
		}

		.encrypted-messages {
			width: 90%;
		}
	}
</style>
