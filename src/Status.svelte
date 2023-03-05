<script lang="ts">
	import type { Controller } from './lib/Controller';
	import { displayPanel } from './lib/ConnectionPanel.svelte';

	export let model: Controller;
	let active_port = model.active_port;
</script>

{#if $active_port?.port != null}
	<div class="w-full bg-green-100 p-1 text-center align-middle text-sm">
		<span class="fa fa-bolt" />
		<span class="text-xs">Connected to:</span>
		<button
			class="link font-mono"
			on:click={() => {
				displayPanel.set(true);
			}}>{$active_port?.port}</button>
	</div>
{:else}
	<div class="fg-rose-900 bg-red-100 text-sm">Not Connected</div>
{/if}
