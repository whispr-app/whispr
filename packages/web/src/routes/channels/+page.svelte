<script lang="ts">
	import { goto } from '$app/navigation';
	import { authedUser } from '$lib/libWhispr.js';
	import { browser } from '$app/environment';

	if ($authedUser) {
		browser && goto('/channels/@self');
	} else {
		browser && goto('/login');
	}
</script>
