<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import GradientText from '$lib/components/GradientText.svelte';
	import Message from '$lib/components/Message.svelte';
	import EncryptedText from '$lib/components/EncryptedText.svelte';
	import AnchorButton from '$lib/components/AnchorButton.svelte';
	import WhisprLogoWhite from '$lib/components/whispr-logo-white.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Home - Whispr</title>
</svelte:head>

<Header />
<section>
	<h1>Privacy that just <GradientText>makes sense.</GradientText></h1>
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
<section>
	<div style="gap: 70px;">
		<div>
			<h1 style="font-size: 200px; padding: 0; margin: 0;">🌍</h1>
		</div>
		<div>
			<h1>Costs <GradientText>nothing.</GradientText></h1>
			<h2>
				<span style="font-variation-settings: 'wdth' 125, 'wght' 200">Whispr</span> relies on
				donations to keep operating.<br /> If you're an advocate for privacy, donate today!
			</h2>
			<div style="display: flex; justify-content: center;">
				<div style="width: 100px;">
					<AnchorButton>Donate</AnchorButton>
				</div>
			</div>
		</div>
	</div>
</section>
<Footer />

<style lang="scss">
	@use 'lib/styles/colours.scss' as colours;
	@use 'lib/styles/textSize.scss' as textSize;

	h1 {
		font-size: textSize.$largest;
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
