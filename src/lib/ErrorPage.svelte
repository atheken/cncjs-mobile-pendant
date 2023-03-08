<script lang="ts">
	import Icon from './Icon.svelte';
	export let error: Error;
</script>

<div class="flex h-full items-center justify-center">
	<div class="text-center align-middle text-sm text-rose-900">
		<Icon icon="warn" class="text-5xl text-rose-900" />
		<div class="text-xl">Well, this is embarrasing.</div>
		<div class="p-4 text-justify text-neutral-500">
			The app is currently unavailable. You may need to restart Cnc.js and reload this app to fix the problem.
		</div>
		<button class="link" on:click={() => window.location.reload()}>Try Again...</button>
		<div class="hidden">
			<pre>{JSON.stringify(error)}</pre>
		</div>
	</div>
</div>
