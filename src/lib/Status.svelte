<script lang="ts">
	import type { AppController } from './AppController';
	import { displayPanel } from './ConnectionPanel.svelte';
	import { derived } from 'svelte/store';

	export let model: AppController;
	let port = derived(model.active_port, (p) => p?.port || false);
</script>

<div class="status w-full p-1 text-center align-middle text-sm" class:ok={$port} class:disconnected={!$port}>
	<span class="fa fa-alert" class:fa-bolt={$port} class:fa-handshake-slash={!$port} />
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
