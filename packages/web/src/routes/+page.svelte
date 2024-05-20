<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Message from '$lib/components/MessageOld.svelte';
	import EncryptedText from '$lib/components/EncryptedText.svelte';
	import AnchorButton from '$lib/components/AnchorButton.svelte';
	import WhisprLogoWhite from '$lib/components/whispr-logo-white.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import FormattedMessageContent from '$lib/components/FormattedMessageContent.svelte';
</script>

<svelte:head>
	<title>Home - Whispr</title>
</svelte:head>

<Header />
<div class="w-full flex justify-center items-center">
	<div
		class="rounded-full text-orange-400 border-orange-400 bg-orange-500 bg-opacity-10 border-2 pl-2 pr-2 w-fit h-fit text-center"
	>
		<FormattedMessageContent
			content=":warning: WARNING! Whispr is currently in development and very much in an unfinished state. Data is
		subject to be wiped and you shouldn't rely on this for secure communication yet."
		></FormattedMessageContent>
	</div>
</div>
<section class="w-vw py-72 text-center flex justify-center items-center flex-col">
	<h1 class="text-text-100 text-6xl inline-block w-fit">
		The best communications app for <h1 class="inline-block text-primary-500">privacy.</h1>
	</h1>
	<h2 class="text-text-400 mt-3 text-5xl w-fit">
		<FormattedMessageContent content="At least we think so. :winking-face:"
		></FormattedMessageContent>
	</h2>
</section>
<section class="max-w-7xl py-48 p-8 ml-auto mr-auto flex justify-center items-start flex-col">
	<h2 class="text-text-100 text-5xl w-full">
		<FormattedMessageContent content="This site is still under construction. :construction:"
		></FormattedMessageContent>
	</h2>
	<h3 class="text-text-400 mt-3 text-4xl w-full">
		More information will come at a later point. For now, check out our <a
			class="inline-block ml-1"
			href="https://github.com/whispr-app/whispr"
			target="_blank">GitHub</a
		>
	</h3>
</section>
<Footer />
