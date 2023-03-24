<script lang="ts">
	import FullscreenNotice from './FullscreenNotice.svelte';
	import Icon from './FontAwesomeIcon.svelte';
	export let error: Error;
</script>

<FullscreenNotice motif="error">
	<span slot="icon" class="fa fa-bomb" />
	<div slot="heading">Well, this is embarrasing.</div>
	<div slot="content">
		The app is currently unavailable. You may need to restart Cnc.js and reload
		this app to fix the problem. <button
			class="link"
			on:click={() => window.location.reload()}>Try Again...</button>
	</div>
</FullscreenNotice>
