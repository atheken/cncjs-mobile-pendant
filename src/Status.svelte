<script lang="ts">
	import type { Controller } from './lib/Controller';
	import { displayPanel } from './lib/ConnectionPanel.svelte';
	import { derived, get } from 'svelte/store';

	export let model: Controller;
	let port = derived(model.active_port, (p) => p?.port || false);
</script>

<div class="status w-full p-1 text-center align-middle text-sm" class:ok={$port} class:disconnected={!$port}>
	<span class="fa fa-alert" class:fa-bolt={$port} class:fa-triangle-exclamation={!$port} />
	{#if $port}
		<span class="text-xs">Connected to:</span>
		<button
			class="link font-mono"
			on:click={() => {
				displayPanel.set(true);
			}}>{$port}</button>
	{:else}
		<span class="text-xs">Not Connected</span>
		<button
			class="link font-mono"
			on:click={() => {
				displayPanel.set(true);
			}}>Connect...</button>
	{/if}
</div>
